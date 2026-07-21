import { Request, Response } from 'express';
import { CreateActivityService } from '../../services/group3-activity/createActivity.service';

export class CreateActivityController {
    private createActivityService = new CreateActivityService();

    public createActivity = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.createActivityService.createActivity(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    public getAllActivities = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.createActivityService.getAllActivities();
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    public getActivityById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                throw new Error('ID hoạt động không hợp lệ.');
            }

            const result = await this.createActivityService.getActivityById(id);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    public updateActivity = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                throw new Error('ID hoạt động không hợp lệ.');
            }

            const result = await this.createActivityService.updateActivity(id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    public deleteActivity = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                throw new Error('ID hoạt động không hợp lệ.');
            }

            await this.createActivityService.deleteActivity(id);
            res.status(200).json({ success: true, message: 'Xóa hoạt động thành công.' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
