import { google } from 'googleapis';
import { storage } from './storage';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

async function getOrCreateSpreadsheet(): Promise<string> {
  const existingId = await storage.getSetting('google_spreadsheet_id');
  
  if (existingId) {
    return existingId;
  }

  const sheets = await getUncachableGoogleSheetClient();
  
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'Marvel Rivals Team Schedule',
      },
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId!;
  
  await storage.setSetting('google_spreadsheet_id', spreadsheetId);
  
  return spreadsheetId;
}

export async function getSpreadsheetId(): Promise<string> {
  return await getOrCreateSpreadsheet();
}

export async function readScheduleFromSheet(sheetName: string) {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:I50`,
    });

    return response.data.values || [];
  } catch (error: any) {
    console.error('Error reading from Google Sheets:', error);
    throw new Error(`Failed to read from Google Sheets: ${error.message}`);
  }
}

export async function writeScheduleToSheet(sheetName: string, data: any[][]) {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    try {
      await sheets.spreadsheets.get({
        spreadsheetId,
      });
    } catch {
      throw new Error('Cannot access spreadsheet. Please check permissions.');
    }

    const allSheets = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetExists = allSheets.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    );

    let sheetId = 0;
    
    if (!sheetExists) {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
      sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId || 0;
    } else {
      const sheet = allSheets.data.sheets?.find(
        (sheet) => sheet.properties?.title === sheetName
      );
      sheetId = sheet?.properties?.sheetId || 0;
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z100`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: data,
      },
    });

    // Apply beautiful formatting
    const numRows = data.length;
    // Get maximum column count across all rows to ensure all columns are formatted
    const numCols = data.length > 0 ? Math.max(...data.map(row => row?.length || 0), 9) : 9;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Auto-resize all columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: numCols,
              },
            },
          },
          // Format title row (row 1) - merge and center
          {
            mergeCells: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: numCols,
              },
              mergeType: 'MERGE_ALL',
            },
          },
          // Style title row - golden background with bold text
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: numCols,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 0.85, blue: 0 }, // Golden yellow
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  textFormat: {
                    bold: true,
                    fontSize: 14,
                  },
                  borders: {
                    top: { style: 'SOLID', width: 2 },
                    bottom: { style: 'SOLID', width: 2 },
                    left: { style: 'SOLID', width: 2 },
                    right: { style: 'SOLID', width: 2 },
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,textFormat,borders)',
            },
          },
          // Style header row (row 3) - golden background with bold text
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 2,
                endRowIndex: 3,
                startColumnIndex: 0,
                endColumnIndex: numCols,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 0.85, blue: 0 }, // Golden yellow
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  textFormat: {
                    bold: true,
                    fontSize: 11,
                  },
                  borders: {
                    top: { style: 'SOLID', width: 1 },
                    bottom: { style: 'SOLID', width: 1 },
                    left: { style: 'SOLID', width: 1 },
                    right: { style: 'SOLID', width: 1 },
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,textFormat,borders)',
            },
          },
          // Style data rows - borders and center alignment
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 3,
                endRowIndex: numRows,
                startColumnIndex: 0,
                endColumnIndex: numCols,
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  borders: {
                    top: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                    bottom: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                    left: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                    right: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                  },
                },
              },
              fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,borders)',
            },
          },
          // Freeze header rows
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                gridProperties: {
                  frozenRowCount: 3,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error writing to Google Sheets:', error);
    throw new Error(`Failed to write to Google Sheets: ${error.message}`);
  }
}

export function convertScheduleToSheetData(scheduleData: any, weekStart: string, weekEnd: string) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const headerRow = ['Role', 'Players', ...days];
  
  const dataRows = scheduleData.players.map((player: any) => {
    const row = [
      player.role,
      player.playerName,
      ...days.map(day => player.availability[day] || 'unknown')
    ];
    return row;
  });

  return [
    [`Team Schedule ${weekStart} - ${weekEnd}`],
    [],
    headerRow,
    ...dataRows
  ];
}

export function convertSheetDataToSchedule(sheetData: any[][]) {
  if (!sheetData || sheetData.length < 4) {
    return { players: [] };
  }

  const headerIndex = 2;
  const players = [];

  for (let i = headerIndex + 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (row && row.length >= 2) {
      const player = {
        playerId: `player-${i}`,
        role: row[0] || 'Tank',
        playerName: row[1] || `Player ${i}`,
        availability: {
          Monday: row[2] || 'unknown',
          Tuesday: row[3] || 'unknown',
          Wednesday: row[4] || 'unknown',
          Thursday: row[5] || 'unknown',
          Friday: row[6] || 'unknown',
          Saturday: row[7] || 'unknown',
          Sunday: row[8] || 'unknown',
        }
      };
      players.push(player);
    }
  }

  return { players };
}
