
import { Request, Response } from "express";
import { BookmarkService } from "../../services/app/bookmark.service";

export const toggleBookmark = async (req: Request, res: Response) => {
    const { postId, producerId } = req.body;
    const userId = req.userId;

    const result = await BookmarkService.toggleBookmark(userId, postId, producerId);
    res.json(result);
};

export const getUserBookmarks = async (req: Request, res: Response) => {
    const userId = req.userId;
    const bookmarks = await BookmarkService.getUserBookmarks(userId);
    res.json(bookmarks);
};

export * as BookmarkController from './bookmark.controller';