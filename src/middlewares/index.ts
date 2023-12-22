import express from 'express';
import { merge, get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { getUserBySessionToken } from '../db/users'; 

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies['ANTONIO-AUTH'];

    if (!sessionToken) {
      return res.sendStatus(403);
    }

    const existingUser = await getUserBySessionToken(sessionToken).select('+authentication.role');

    if (!existingUser) {
      return res.sendStatus(403);
    }

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, 'identity._id') as string;

    if (!currentUserId) {
      return res.sendStatus(400);
    }

    if (currentUserId.toString() !== id) {
      return res.sendStatus(403);
    }

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const currentUserRole = get(req, 'identity.authentication.role') as string;
    if (currentUserRole !== 'admin') return res.sendStatus(403);

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const addIdToRequest = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    req.id = uuidv4()

    return next()
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}