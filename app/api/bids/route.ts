import { NextResponse } from 'next/server';
import sql from 'mssql';

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Validate configuration
const validateConfig = () => {
  const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
};

// GET handler to fetch all bids
export async function GET(req: Request) {
  const startTime = Date.now();
  let connection: sql.ConnectionPool | null = null;
  
  try {
    validateConfig();
    
    // Get vendor code from query params if provided
    const url = new URL(req.url);
    const vendorCode = url.searchParams.get('vendorCode');
    
    // Connect to database
    connection = await sql.connect(dbConfig);
    console.log('[API] Connected to database');
    
    // Build query based on whether vendorCode is provided
    let query = `
      SELECT 
        MRCTransFormID,
        VendorCode,
        CONVERT(VARCHAR(10), BidSendDate, 120) as BidSendDate,
        CONVERT(VARCHAR(10), BidReceivedDate, 120) as BidReceivedDate,
        OneWayTripCost,
        RoundTripCost,
        SharedRideCost,
        SharedRideWith,
        Awarded,
        BidComments
      FROM dbo.MRCBidResults
    `;
    
    // Add WHERE clause if vendorCode is provided
    if (vendorCode) {
      query += ` WHERE VendorCode = @vendorCode`;
    }
    
    // Add ORDER BY clause
    query += ` ORDER BY BidSendDate DESC`;
    
    // Create request
    const request = connection.request();
    
    // Add parameter if vendorCode is provided
    if (vendorCode) {
      request.input('vendorCode', sql.VarChar, vendorCode);
    }
    
    // Execute query
    const result = await request.query(query);
    
    return NextResponse.json(result.recordset, { status: 200 });
    
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime
    };
    
    console.error('[API] Error fetching bids:', errorDetails);
    
    return NextResponse.json({
      success: false,
      error: errorDetails,
      message: `Failed to fetch bids: ${errorDetails.message}`
    }, { status: 500 });
    
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('[API] Connection closed successfully');
      } catch (err) {
        console.error('[API] Error closing connection:', err);
      }
    }
  }
}

// POST handler to submit a new bid
export async function POST(req: Request) {
  const startTime = Date.now();
  let connection: sql.ConnectionPool | null = null;
  
  try {
    validateConfig();
    
    // Parse request body
    const bidData = await req.json();
    console.log('[API] Received bid data:', JSON.stringify(bidData));
    
    // Validate required fields
    const requiredFields = ['MRCTransFormID', 'VendorCode', 'OneWayTripCost', 'RoundTripCost'];
    const missingFields = requiredFields.filter(field => bidData[field] === undefined || bidData[field] === null);
    
    if (missingFields.length > 0) {
      console.log('[API] Missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }
    
    // Additional validation for MRCTransFormID
    if (!bidData.MRCTransFormID || typeof bidData.MRCTransFormID !== 'string') {
      console.log('[API] Invalid MRCTransFormID:', bidData.MRCTransFormID, 'Type:', typeof bidData.MRCTransFormID);
      return NextResponse.json({
        success: false,
        message: `Invalid MRCTransFormID: Must be a non-empty string`
      }, { status: 400 });
    }
    
    // Connect to database
    connection = await sql.connect(dbConfig);
    console.log('[API] Connected to database');
    
    // Ensure numeric values are properly formatted
    const oneWayTripCost = typeof bidData.OneWayTripCost === 'string' 
      ? parseFloat(bidData.OneWayTripCost) 
      : bidData.OneWayTripCost;
      
    const roundTripCost = typeof bidData.RoundTripCost === 'string' 
      ? parseFloat(bidData.RoundTripCost) 
      : bidData.RoundTripCost;
      
    const sharedRideCost = bidData.SharedRideCost 
      ? (typeof bidData.SharedRideCost === 'string' 
        ? parseFloat(bidData.SharedRideCost) 
        : bidData.SharedRideCost)
      : null;
    
    // Create request with parameters
    const request = connection.request();
    
    // Ensure MRCTransFormID is properly formatted
    const mrcTransFormID = String(bidData.MRCTransFormID).trim();
    console.log('[API] MRCTransFormID value:', mrcTransFormID, 'Type:', typeof mrcTransFormID);
    
    request.input('MRCTransFormID', sql.NVarChar(50), mrcTransFormID);
    request.input('VendorCode', sql.NVarChar(50), bidData.VendorCode);
    request.input('BidSendDate', sql.Date, bidData.BidSendDate ? new Date(bidData.BidSendDate) : new Date());
    request.input('BidReceivedDate', sql.Date, bidData.BidReceivedDate ? new Date(bidData.BidReceivedDate) : new Date());
    request.input('OneWayTripCost', sql.Money, oneWayTripCost);
    request.input('RoundTripCost', sql.Money, roundTripCost);
    request.input('SharedRideCost', sql.Money, sharedRideCost);
    request.input('SharedRideWith', sql.NVarChar(100), bidData.SharedRideWith || null);
    request.input('Awarded', sql.Bit, bidData.Awarded ? 1 : 0);
    request.input('BidComments', sql.NVarChar(500), bidData.BidComments || null);
    
    console.log('[API] Executing SQL query with parameters:', {
      MRCTransFormID: bidData.MRCTransFormID,
      VendorCode: bidData.VendorCode,
      BidSendDate: bidData.BidSendDate,
      BidReceivedDate: bidData.BidReceivedDate,
      OneWayTripCost: oneWayTripCost,
      RoundTripCost: roundTripCost,
      SharedRideCost: sharedRideCost,
      SharedRideWith: bidData.SharedRideWith,
      Awarded: bidData.Awarded ? 1 : 0,
      BidComments: bidData.BidComments
    });
    
    // Check if a bid already exists for this MRCTransFormID and VendorCode
    const checkResult = await request.query(`
      SELECT COUNT(*) as count 
      FROM dbo.MRCBidResults 
      WHERE MRCTransFormID = @MRCTransFormID AND VendorCode = @VendorCode
    `);
    
    const exists = checkResult.recordset[0].count > 0;
    
    // Log the check result
    console.log('[API] Bid exists check:', { exists, count: checkResult.recordset[0].count });
    
    let result;
    
    if (exists) {
      // Update existing bid
      console.log('[API] Updating existing bid');
      result = await request.query(`
        UPDATE dbo.MRCBidResults
        SET 
          BidSendDate = @BidSendDate,
          BidReceivedDate = @BidReceivedDate,
          OneWayTripCost = @OneWayTripCost,
          RoundTripCost = @RoundTripCost,
          SharedRideCost = @SharedRideCost,
          SharedRideWith = @SharedRideWith,
          Awarded = @Awarded,
          BidComments = @BidComments
        WHERE MRCTransFormID = @MRCTransFormID AND VendorCode = @VendorCode;
        
        SELECT 1 AS UpdatedId;
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Bid updated successfully',
        updatedId: result.recordset[0].UpdatedId
      }, { status: 200 });
    } else {
      // Insert new bid
      console.log('[API] Inserting new bid');
      result = await request.query(`
        INSERT INTO dbo.MRCBidResults (
          MRCTransFormID,
          VendorCode,
          BidSendDate,
          BidReceivedDate,
          OneWayTripCost,
          RoundTripCost,
          SharedRideCost,
          SharedRideWith,
          Awarded,
          BidComments
        )
        VALUES (
          @MRCTransFormID,
          @VendorCode,
          @BidSendDate,
          @BidReceivedDate,
          @OneWayTripCost,
          @RoundTripCost,
          @SharedRideCost,
          @SharedRideWith,
          @Awarded,
          @BidComments
        );
        
        SELECT SCOPE_IDENTITY() AS InsertedId;
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Bid submitted successfully',
        insertedId: result.recordset[0].InsertedId
      }, { status: 201 });
    }
    
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime
    };
    
    // Log detailed error information
    console.error('[API] Error submitting bid:', errorDetails);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check for specific SQL errors
    if (error instanceof Error) {
      if (error.message.includes('Validation failed for parameter')) {
        console.error('[API] SQL parameter validation error. Check data types and lengths.');
      }
      
      if (error.message.includes('MRCTransFormID')) {
        console.error('[API] Error related to MRCTransFormID parameter.');
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorDetails,
      message: `Failed to submit bid: ${errorDetails.message}`
    }, { status: 500 });
    
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('[API] Connection closed successfully');
      } catch (err) {
        console.error('[API] Error closing connection:', err);
      }
    }
  }
} 