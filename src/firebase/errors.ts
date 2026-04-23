'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  path: string;
  operation: string;
  requestResourceData?: any;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
{
  "method": "${context.operation}",
  "path": "${context.path}"${context.requestResourceData ? `,\n  "request": { "resource": { "data": ${JSON.stringify(context.requestResourceData, null, 2)} } }` : ''}
}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.path = context.path;
    this.operation = context.operation;
    this.requestResourceData = context.requestResourceData;
  }
}
