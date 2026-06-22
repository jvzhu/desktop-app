export const IPC_CHANNELS = {
  fsRead: 'fs:read',
  fsWrite: 'fs:write',
  fsDelete: 'fs:delete',
  fsList: 'fs:list',
  dialogOpen: 'dialog:open',
  dialogSave: 'dialog:save',
  dialogMessage: 'dialog:message',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  notesList: 'notes:list',
  notesUpsert: 'notes:upsert',
  notesDelete: 'notes:delete',
  recentList: 'recent:list',
  recentAdd: 'recent:add',
  dataExport: 'data:export',
  dataImport: 'data:import',
  syncNow: 'sync:now',
  credentialSet: 'credential:set',
  credentialGet: 'credential:get',
} as const;

export interface ReadFilePayload {
  path: string;
}

export interface WriteFilePayload {
  path: string;
  content: string;
}

export interface DeleteFilePayload {
  path: string;
}

export interface ListFilesPayload {
  path: string;
}
