import { pool } from '../../config/db';

export interface NearbyUser {
  nguoiDungId: number;
  hoTen: string;
  anhDaiDien?: string;
  soThichChung: string[];
  khoangCachKm: number;
  viDo: number;
  kinhDo: number;
}

export interface MatchSession {
  matchId: string;
  userAId: number;
  userBId: number;
  socketAId: string;
  socketBId: string;
  acceptedA: boolean;
  acceptedB: boolean;
  createdAt: Date;
  timer?: ReturnType<typeof setTimeout>;
}

export class NearbyService {
  // In-memory match sessions (key = matchId)
  private matchSessions = new Map<string, MatchSession>();

  // Bắt đầu phiên quét - lưu vị trí người dùng
  async startScan(nguoiDungId: number, viDo: number, kinhDo: number, socketId: string): Promise<void> {
    await pool.query(`
      INSERT INTO phien_quet_ban (nguoi_dung_id, vi_do, kinh_do, socket_id, het_han_luc)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '10 minutes')
      ON CONFLICT (nguoi_dung_id)
      DO UPDATE SET vi_do = $2, kinh_do = $3, socket_id = $4, 
                    bat_dau_luc = NOW(), het_han_luc = NOW() + INTERVAL '10 minutes'
    `, [nguoiDungId, viDo, kinhDo, socketId]);

    // Dọn phiên hết hạn
    await pool.query(`DELETE FROM phien_quet_ban WHERE het_han_luc < NOW()`);
  }

  // Dừng phiên quét
  async stopScan(nguoiDungId: number): Promise<void> {
    await pool.query(`DELETE FROM phien_quet_ban WHERE nguoi_dung_id = $1`, [nguoiDungId]);
  }

  // Cập nhật socket_id mới (khi reconnect)
  async updateSocketId(nguoiDungId: number, socketId: string): Promise<void> {
    await pool.query(
      `UPDATE phien_quet_ban SET socket_id = $1 WHERE nguoi_dung_id = $2`,
      [socketId, nguoiDungId]
    );
  }

  // Tìm người phù hợp: trong 10km + có chung sở thích + không phải bạn bè rồi + không đang match
  async findMatches(nguoiDungId: number, viDo: number, kinhDo: number, excludeIds: number[] = []): Promise<NearbyUser[]> {
    const excludeList = [nguoiDungId, ...excludeIds];

    const result = await pool.query(`
      WITH my_interests AS (
        SELECT st.so_thich_id, st.ten_so_thich
        FROM ho_so_so_thich hss
        JOIN ho_so_nguoi_dung hnd ON hss.ho_so_id = hnd.ho_so_id
        JOIN so_thich st ON hss.so_thich_id = st.so_thich_id
        WHERE hnd.nguoi_dung_id = $1
      ),
      nearby AS (
        SELECT
          pqb.nguoi_dung_id,
          pqb.vi_do,
          pqb.kinh_do,
          pqb.socket_id,
          nd.ho_ten,
          hnd.anh_dai_dien,
          (6371 * acos(
            GREATEST(-1, LEAST(1,
              cos(radians($2)) * cos(radians(pqb.vi_do)) *
              cos(radians(pqb.kinh_do) - radians($3)) +
              sin(radians($2)) * sin(radians(pqb.vi_do))
            ))
          )) AS khoang_cach_km
        FROM phien_quet_ban pqb
        JOIN nguoi_dung nd ON pqb.nguoi_dung_id = nd.nguoi_dung_id
        JOIN ho_so_nguoi_dung hnd ON hnd.nguoi_dung_id = pqb.nguoi_dung_id
        WHERE pqb.nguoi_dung_id != ALL($4::bigint[])
          AND pqb.het_han_luc > NOW()
      ),
      with_interests AS (
        SELECT
          n.*,
          array_agg(DISTINCT mi.ten_so_thich) FILTER (WHERE mi.ten_so_thich IS NOT NULL) AS so_thich_chung,
          count(DISTINCT mi.so_thich_id) AS count_chung
        FROM nearby n
        LEFT JOIN ho_so_nguoi_dung hnd2 ON hnd2.nguoi_dung_id = n.nguoi_dung_id
        LEFT JOIN ho_so_so_thich hss2 ON hss2.ho_so_id = hnd2.ho_so_id
        LEFT JOIN my_interests mi ON mi.so_thich_id = hss2.so_thich_id
        GROUP BY n.nguoi_dung_id, n.vi_do, n.kinh_do, n.socket_id, n.ho_ten, n.anh_dai_dien, n.khoang_cach_km
      )
      SELECT * FROM with_interests
      WHERE khoang_cach_km <= 10
        AND count_chung > 0
        -- Chưa là bạn bè
        AND NOT EXISTS (
          SELECT 1 FROM quan_he_ket_noi qhk
          WHERE (qhk.nguoi_dung_id_1 = $1 AND qhk.nguoi_dung_id_2 = nguoi_dung_id)
             OR (qhk.nguoi_dung_id_2 = $1 AND qhk.nguoi_dung_id_1 = nguoi_dung_id)
        )
      ORDER BY count_chung DESC, khoang_cach_km ASC
      LIMIT 1
    `, [nguoiDungId, viDo, kinhDo, excludeList]);

    return result.rows.map(row => ({
      nguoiDungId: Number(row.nguoi_dung_id),
      hoTen: row.ho_ten,
      anhDaiDien: row.anh_dai_dien,
      soThichChung: row.so_thich_chung || [],
      khoangCachKm: Math.round(Number(row.khoang_cach_km) * 10) / 10,
      viDo: Number(row.vi_do),
      kinhDo: Number(row.kinh_do),
      socketId: row.socket_id,
    }));
  }

  // Tạo match session mới
  createMatchSession(userAId: number, userBId: number, socketAId: string, socketBId: string): MatchSession {
    const matchId = `match_${userAId}_${userBId}_${Date.now()}`;
    const session: MatchSession = {
      matchId,
      userAId,
      userBId,
      socketAId,
      socketBId,
      acceptedA: false,
      acceptedB: false,
      createdAt: new Date(),
    };
    this.matchSessions.set(matchId, session);
    return session;
  }

  getMatchSession(matchId: string): MatchSession | undefined {
    return this.matchSessions.get(matchId);
  }

  // Đánh dấu người dùng đồng ý
  acceptMatch(matchId: string, nguoiDungId: number): { bothAccepted: boolean } {
    const session = this.matchSessions.get(matchId);
    if (!session) return { bothAccepted: false };

    if (nguoiDungId === session.userAId) session.acceptedA = true;
    if (nguoiDungId === session.userBId) session.acceptedB = true;

    return { bothAccepted: session.acceptedA && session.acceptedB };
  }

  clearMatchSession(matchId: string): void {
    const session = this.matchSessions.get(matchId);
    if (session?.timer) clearTimeout(session.timer);
    this.matchSessions.delete(matchId);
  }

  setMatchTimer(matchId: string, timer: ReturnType<typeof setTimeout>): void {
    const session = this.matchSessions.get(matchId);
    if (session) session.timer = timer;
  }

  // Tạo kết bạn + phòng chat riêng sau khi cả 2 đồng ý
  async finalizeMatch(userAId: number, userBId: number): Promise<{ chatRoomId: number }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Tạo quan hệ kết nối nếu chưa có
      await client.query(`
        INSERT INTO quan_he_ket_noi (nguoi_dung_id_1, nguoi_dung_id_2, trang_thai)
        VALUES ($1, $2, 'ACTIVE')
        ON CONFLICT DO NOTHING
      `, [Math.min(userAId, userBId), Math.max(userAId, userBId)]);

      // Kiểm tra phòng chat RIENG_TU đã tồn tại chưa
      const existingRoom = await client.query(`
        SELECT p.phong_id FROM phong_tro_chuyen p
        JOIN thanh_vien_phong tv1 ON tv1.phong_id = p.phong_id AND tv1.nguoi_dung_id = $1
        JOIN thanh_vien_phong tv2 ON tv2.phong_id = p.phong_id AND tv2.nguoi_dung_id = $2
        WHERE p.loai_phong = 'RIENG_TU'
        LIMIT 1
      `, [userAId, userBId]);

      let chatRoomId: number;

      if (existingRoom.rows.length > 0) {
        chatRoomId = Number(existingRoom.rows[0].phong_id);
      } else {
        // Lấy tên cả 2 người
        const namesRes = await client.query(
          `SELECT nguoi_dung_id, ho_ten FROM nguoi_dung WHERE nguoi_dung_id = ANY($1::bigint[])`,
          [[userAId, userBId]]
        );
        const names = namesRes.rows.reduce((acc: any, r: any) => {
          acc[r.nguoi_dung_id] = r.ho_ten;
          return acc;
        }, {});

        // Tạo phòng chat mới
        const roomRes = await client.query(`
          INSERT INTO phong_tro_chuyen (ten_phong, loai_phong, trang_thai)
          VALUES ($1, 'RIENG_TU', 'ACTIVE')
          RETURNING phong_id
        `, [`${names[userAId] || 'User'} & ${names[userBId] || 'User'}`]);

        chatRoomId = Number(roomRes.rows[0].phong_id);

        // Thêm cả 2 vào phòng
        await client.query(`
          INSERT INTO thanh_vien_phong (phong_id, nguoi_dung_id)
          VALUES ($1, $2), ($1, $3)
          ON CONFLICT DO NOTHING
        `, [chatRoomId, userAId, userBId]);
      }

      // Xóa phiên quét của cả 2
      await client.query(`DELETE FROM phien_quet_ban WHERE nguoi_dung_id = ANY($1::bigint[])`, [[userAId, userBId]]);

      await client.query('COMMIT');
      return { chatRoomId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Lấy socket_id của người dùng trong phiên quét
  async getSocketId(nguoiDungId: number): Promise<string | null> {
    const res = await pool.query(
      `SELECT socket_id FROM phien_quet_ban WHERE nguoi_dung_id = $1`,
      [nguoiDungId]
    );
    return res.rows[0]?.socket_id || null;
  }
}
