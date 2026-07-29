import { pool } from '../../config/db';

export interface NearbyUser {
  nguoiDungId: number;
  hoTen: string;
  anhDaiDien?: string;
  soThichChung: string[];
  khoangCachKm: number;
  viDo: number;
  kinhDo: number;
  socketId?: string;
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

  // In-memory friend proposal agreements (key = roomId, value = Set of userIds who clicked agree)
  private friendProposals = new Map<number, Set<number>>();

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
      userAId: Number(userAId),
      userBId: Number(userBId),
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

  // Đánh dấu người dùng đồng ý trong màn hình 30s
  acceptMatch(matchId: string, nguoiDungId: number): { bothAccepted: boolean } {
    const session = this.matchSessions.get(matchId);
    if (!session) return { bothAccepted: false };

    const uid = Number(nguoiDungId);
    if (uid === Number(session.userAId)) session.acceptedA = true;
    if (uid === Number(session.userBId)) session.acceptedB = true;

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

  // Tạo/lấy phòng chat tạm thời 10 phút sau khi cả 2 đồng ý ở màn hình quét
  async finalizeMatch(userAId: number, userBId: number): Promise<{ chatRoomId: number }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const uA = Number(userAId);
      const uB = Number(userBId);

      // Kiểm tra phòng chat RIENG_TU đã tồn tại chưa
      const existingRoom = await client.query(`
        SELECT p.phong_id FROM phong_tro_chuyen p
        JOIN thanh_vien_phong tv1 ON tv1.phong_id = p.phong_id AND tv1.nguoi_dung_id = $1
        JOIN thanh_vien_phong tv2 ON tv2.phong_id = p.phong_id AND tv2.nguoi_dung_id = $2
        WHERE p.loai_phong = 'RIENG_TU'
        LIMIT 1
      `, [uA, uB]);

      let chatRoomId: number;

      if (existingRoom.rows.length > 0) {
        chatRoomId = Number(existingRoom.rows[0].phong_id);
        // Cập nhật lại thời hạn 10 phút cho chat tạm thời
        await client.query(`
          UPDATE phong_tro_chuyen 
          SET het_han_luc = NOW() + INTERVAL '10 minutes', trang_thai = 'ACTIVE'
          WHERE phong_id = $1
        `, [chatRoomId]);
      } else {
        // Lấy tên cả 2 người
        const namesRes = await client.query(
          `SELECT nguoi_dung_id, ho_ten FROM nguoi_dung WHERE nguoi_dung_id = ANY($1::bigint[])`,
          [[uA, uB]]
        );
        const names = namesRes.rows.reduce((acc: any, r: any) => {
          acc[r.nguoi_dung_id] = r.ho_ten;
          return acc;
        }, {});

        // Tạo phòng chat tạm thời mới có thời hạn 10 phút
        const roomRes = await client.query(`
          INSERT INTO phong_tro_chuyen (ten_phong, loai_phong, trang_thai, het_han_luc)
          VALUES ($1, 'RIENG_TU', 'ACTIVE', NOW() + INTERVAL '10 minutes')
          RETURNING phong_id
        `, [`${names[uA] || 'User'} & ${names[uB] || 'User'}`]);

        chatRoomId = Number(roomRes.rows[0].phong_id);

        // Thêm cả 2 vào phòng
        await client.query(`
          INSERT INTO thanh_vien_phong (phong_id, nguoi_dung_id)
          VALUES ($1, $2), ($1, $3)
          ON CONFLICT DO NOTHING
        `, [chatRoomId, uA, uB]);
      }

      // Xóa phiên quét của cả 2
      await client.query(`DELETE FROM phien_quet_ban WHERE nguoi_dung_id = ANY($1::bigint[])`, [[uA, uB]]);

      await client.query('COMMIT');
      return { chatRoomId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Đề xuất kết bạn trong khung chat: người dùng bấm Đồng ý
  async acceptFriendProposal(phongId: number, nguoiDungId: number): Promise<{ bothAccepted: boolean; isFriend: boolean }> {
    const pId = Number(phongId);
    const uId = Number(nguoiDungId);

    // Lưu vào bảng de_xuat_ket_ban
    await pool.query(`
      INSERT INTO de_xuat_ket_ban (phong_id, nguoi_dung_id, trang_thai)
      VALUES ($1, $2, 'AGREED')
      ON CONFLICT (phong_id, nguoi_dung_id)
      DO UPDATE SET trang_thai = 'AGREED'
    `, [pId, uId]);

    // Lấy tất cả thành viên phòng
    const membersRes = await pool.query(
      `SELECT nguoi_dung_id FROM thanh_vien_phong WHERE phong_id = $1`,
      [pId]
    );
    const memberIds = membersRes.rows.map((r: any) => Number(r.nguoi_dung_id));

    // Lấy danh sách thành viên đã đồng ý trong DB
    const agreedRes = await pool.query(
      `SELECT nguoi_dung_id FROM de_xuat_ket_ban WHERE phong_id = $1 AND trang_thai = 'AGREED'`,
      [pId]
    );
    const agreedUserIds = new Set(agreedRes.rows.map((r: any) => Number(r.nguoi_dung_id)));

    const bothAccepted = memberIds.length >= 2 && memberIds.every((id) => agreedUserIds.has(id));

    if (bothAccepted && memberIds.length >= 2) {
      const u1 = memberIds[0]!;
      const u2 = memberIds[1]!;

      // Thêm vào bạn bè
      await pool.query(`
        INSERT INTO quan_he_ket_noi (nguoi_dung_id_1, nguoi_dung_id_2, trang_thai)
        VALUES ($1, $2, 'ACTIVE')
        ON CONFLICT DO NOTHING
      `, [Math.min(u1, u2), Math.max(u1, u2)]);

      // Xóa hết hạn 10 phút -> biến thành chat vĩnh viễn
      await pool.query(`
        UPDATE phong_tro_chuyen SET het_han_luc = NULL WHERE phong_id = $1
      `, [pId]);

      return { bothAccepted: true, isFriend: true };
    }

    return { bothAccepted: false, isFriend: false };
  }

  // Từ chối đề xuất kết bạn — VẪN CHO CHAT TIẾP TRONG 10 PHÚT
  async declineFriendProposal(phongId: number, nguoiDungId: number): Promise<void> {
    const pId = Number(phongId);
    const uId = Number(nguoiDungId);

    // Lưu trạng thái DECLINED vào DB (vẫn cho chat tiếp trong 10 phút)
    await pool.query(`
      INSERT INTO de_xuat_ket_ban (phong_id, nguoi_dung_id, trang_thai)
      VALUES ($1, $2, 'DECLINED')
      ON CONFLICT (phong_id, nguoi_dung_id)
      DO UPDATE SET trang_thai = 'DECLINED'
    `, [pId, uId]);
  }

  // Lấy trạng thái đề xuất kết bạn từ DB cho 1 phòng
  async getProposalStatus(phongId: number, nguoiDungId: number): Promise<{ myProposal: string; otherProposal: string }> {
    const pId = Number(phongId);
    const uId = Number(nguoiDungId);

    const res = await pool.query(`
      SELECT nguoi_dung_id, trang_thai FROM de_xuat_ket_ban WHERE phong_id = $1
    `, [pId]);

    let myProposal = 'NONE';
    let otherProposal = 'NONE';

    res.rows.forEach((row: any) => {
      if (Number(row.nguoi_dung_id) === uId) {
        myProposal = row.trang_thai;
      } else {
        otherProposal = row.trang_thai;
      }
    });

    return { myProposal, otherProposal };
  }

  // Dọn dẹp các phòng chat tạm thời đã hết hạn 10 phút (xóa hoàn toàn phòng và tin nhắn)
  async cleanupExpiredRooms(): Promise<void> {
    try {
      await pool.query(`
        DELETE FROM phong_tro_chuyen
        WHERE het_han_luc IS NOT NULL 
          AND het_han_luc < NOW()
          AND NOT EXISTS (
            SELECT 1 FROM quan_he_ket_noi qhk
            JOIN thanh_vien_phong tvp1 ON tvp1.phong_id = phong_tro_chuyen.phong_id
            JOIN thanh_vien_phong tvp2 ON tvp2.phong_id = phong_tro_chuyen.phong_id AND tvp2.nguoi_dung_id != tvp1.nguoi_dung_id
            WHERE (qhk.nguoi_dung_id_1 = tvp1.nguoi_dung_id AND qhk.nguoi_dung_id_2 = tvp2.nguoi_dung_id)
               OR (qhk.nguoi_dung_id_2 = tvp1.nguoi_dung_id AND qhk.nguoi_dung_id_1 = tvp2.nguoi_dung_id)
          )
      `);
    } catch (err) {
      console.error("cleanupExpiredRooms error:", err);
    }
  }
}
