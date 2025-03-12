import { NextResponse } from 'next/server'
import sql from 'mssql'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // For Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
    connectionTimeout: 30000, // 30 seconds
    requestTimeout: 30000,    // 30 seconds
  }
}

// Validate environment variables
const validateConfig = () => {
  const required = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate form data
const validateFormData = (formData: any) => {
  if (!formData?.fields?.length) {
    throw new Error('Form data is required and must contain fields array');
  }
};

// Add type definition at the top of the file
type SqlResult = {
  recordset?: Array<{ InsertedId: number }>;
};

// Add this function before your POST handler
const parseDaySchedules = (formData: any) => {
  // Initialize all day variables with 'N/A'
  const daySchedules = {
    SunArrivalTime: 'N/A',
    SunDepartureTime: 'N/A',
    MonArrivalTime: 'N/A',
    MonDepartureTime: 'N/A',
    TueArrivalTime: 'N/A',
    TueDepartureTime: 'N/A',
    WedArrivalTime: 'N/A',
    WedDepartureTime: 'N/A',
    ThuArrivalTime: 'N/A',
    ThuDepartureTime: 'N/A',
    FriArrivalTime: 'N/A',
    FriDepartureTime: 'N/A',
    SatArrivalTime: 'N/A',
    SatDepartureTime: 'N/A',
  };

  // Parse arrival dates
  const arrivalDates = formData.fields.find((f: any) => 
    f.label === 'Program Arrival Dates')?.value || '';
  
  // Parse departure dates
  const departureDates = formData.fields.find((f: any) => 
    f.label === 'Program Departure Dates')?.value || '';

  if (!arrivalDates || arrivalDates === 'N/A') {
    console.log('[API] No arrival dates found.');
  }
  
  if (!departureDates || departureDates === 'N/A') {
    console.log('[API] No departure dates found.');
  }

  console.log('[API] Raw schedule data:', {
    arrivalDates,
    departureDates,
  });

  // Map of full day names to abbreviated column names
  const dayMap: Record<string, string> = {
    'Sunday': 'Sun',
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat'
  };

  // Parse arrival times
  if (arrivalDates && arrivalDates !== 'N/A') {
    // Split the entire string into day-time pairs
    const pairs: string[] = arrivalDates.split(';');
    console.log('[API] Arrival pairs after split:', pairs);

    // Process each day-time pair
    for (let i = 0; i < pairs.length; i += 2) {
      const day = pairs[i]?.trim();
      const time = pairs[i + 1]?.trim();
      
      console.log('[API] Processing arrival:', { index: i, day, time, totalPairs: pairs.length });
      
      if (!day || !time) {
        console.log('[API] Missing day or time in arrival pair, skipping');
        continue;
      }
      
      const dayKey = dayMap[day];
      if (!dayKey) {
        console.log(`[API] Unknown day: ${day}`);
        continue;
      }
      
      console.log(`[API] Setting ${dayKey}ArrivalTime to ${time}`);
      daySchedules[`${dayKey}ArrivalTime` as keyof typeof daySchedules] = time;
    }
  } else {
    console.log('[API] No valid arrival dates to process');
  }

  // Parse departure times
  if (departureDates && departureDates !== 'N/A') {
    // Split the entire string into day-time pairs
    const pairs: string[] = departureDates.split(';');
    console.log('[API] Departure pairs after split:', pairs);

    // Process each day-time pair
    for (let i = 0; i < pairs.length; i += 2) {
      const day = pairs[i]?.trim();
      const time = pairs[i + 1]?.trim();
      
      console.log('[API] Processing departure:', { index: i, day, time, totalPairs: pairs.length });
      
      if (!day || !time) {
        console.log('[API] Missing day or time in departure pair, skipping');
        continue;
      }
      
      const dayKey = dayMap[day];
      if (!dayKey) {
        console.log(`[API] Unknown day: ${day}`);
        continue;
      }
      
      console.log(`[API] Setting ${dayKey}DepartureTime to ${time}`);
      daySchedules[`${dayKey}DepartureTime` as keyof typeof daySchedules] = time;
    }
  } else {
    console.log('[API] No valid departure dates to process');
  }

  console.log('[API] Final day schedules:', daySchedules);
  return daySchedules;
};

// Add these helper functions after validateFormData
const formatDateForSql = (dateStr: string): string | null => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Pending') {
    console.log('[API] Empty or invalid date string:', dateStr);
    return new Date().toISOString().split('T')[0]; // Default to today's date
  }
  
  try {
    console.log('[API] Formatting date for SQL:', dateStr);
    
    // Handle American date format (MM/DD/YYYY)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (!isNaN(date.getTime())) {
        const formatted = date.toISOString().split('T')[0];
        console.log(`[API] Formatted date: ${formatted}`);
        return formatted;
      }
    }
    
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const formatted = date.toISOString().split('T')[0];
      console.log(`[API] Formatted date: ${formatted}`);
      return formatted;
    }
    
    console.log('[API] Could not parse date, using default');
    return new Date().toISOString().split('T')[0]; // Default to today's date
  } catch (error) {
    console.error('[API] Error formatting date:', error);
    return new Date().toISOString().split('T')[0]; // Default to today's date
  }
};

const formatTimeForSql = (timeStr: string): Date | null => {
  if (!timeStr || timeStr === 'N/A') return null;
  
  console.log('[API] Formatting time for SQL:', timeStr);
  
  try {
    // Remove any extra whitespace and convert to uppercase
    const cleanTime = timeStr.trim().toUpperCase();
    
    // Create a base date to use (today's date doesn't matter, just the time portion)
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0); // Start with midnight
    
    // Special case for AM/PM format with no space (e.g., "10:00AM")
    if (/^(\d{1,2}):(\d{2})(AM|PM)$/i.test(cleanTime)) {
      const match = cleanTime.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
      if (match) {
        let [_, hours, minutes, period] = match;
        let hour = parseInt(hours);
        
        // Convert 12-hour format to 24-hour
        if (period.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        // Set the time parts on our base date
        baseDate.setHours(hour, parseInt(minutes), 0, 0);
        console.log(`[API] Formatted time as Date: ${baseDate.toISOString()}`);
        return baseDate;
      }
    }
    
    // Try to match various time formats
    const timeFormats = [
      // 1:30 PM, 01:30 PM, 1:30PM, 01:30PM
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i,
      // 1 PM, 01 PM, 1PM, 01PM
      /^(\d{1,2})\s*(AM|PM)?$/i,
      // 13:30 (24-hour)
      /^(\d{2}):(\d{2})$/,
      // 13 (24-hour)
      /^(\d{2})$/
    ];

    for (const format of timeFormats) {
      const match = cleanTime.match(format);
      if (match) {
        let [_, hours, minutes = '00', period] = match;
        let hour = parseInt(hours);

        // Convert 12-hour format to 24-hour
        if (period) {
          if (period.toUpperCase() === 'PM' && hour < 12) hour += 12;
          if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
        }

        // Validate hours and minutes
        if (hour >= 24 || (minutes && parseInt(minutes) >= 60)) {
          console.log('[API] Invalid time format:', { hour, minutes });
          return null;
        }

        // Set the time parts on our base date
        baseDate.setHours(hour, parseInt(minutes), 0, 0);
        console.log(`[API] Formatted time as Date: ${baseDate.toISOString()}`);
        return baseDate;
      }
    }
    
    console.log('[API] Could not parse time format:', cleanTime);
    return null;
  } catch (error) {
    console.error('[API] Error formatting time:', error);
    return null;
  }
};

const convertToBit = (value: string): boolean | null => {
  if (!value || value === 'N/A') return null;
  return /^yes|true|1$/i.test(value.toLowerCase().trim());
};

// Add this GET handler before the POST handler
export async function GET() {
  let connection: sql.ConnectionPool | null = null;
  const startTime = Date.now();

  try {
    validateConfig();
    connection = await new sql.ConnectionPool(config).connect();
    
    const result = await connection.request().query(`
      SELECT TOP (10)
        MRCTransFormID,
        ServiceType,
        CONVERT(VARCHAR(10), StartDate, 120) as StartDate,
        CONVERT(VARCHAR(10), EndDate, 120) as EndDate,
        ClientFName,
        ClientLName,
        ClientGender,
        ClientLanguage,
        ClientPhone,
        CONVERT(VARCHAR(10), ClientDOB, 120) as ClientDOB,
        ClientEmergencyContact,
        ClientEmergencyPhone,
        ClientEmergencyPhoneEXT,
        PickUpAddress,
        PickUpCity,
        PickUpState,
        PickUpZip,
        TypeOfVehicle,
        WCTypeSize,
        Monitor,
        DropOffFacilityName,
        DropOffAddress,
        DropOffCity,
        DropOffState,
        DropOffZip,
        DropOffContact,
        DropOffPhone,
        DropOffPhoneEXT,
        AltAddressFacilityName,
        AltAddressCity,
        AltAddressState,
        AltAddressZip,
        AltAddressContact,
        AltAddressPhone,
        AltAddressPhoneEXT,
        SunArrivalTime,
        SunDepartureTime,
        MonArrivalTime,
        MonDepartureTime,
        TueArrivalTime,
        TueDepartureTime,
        WedArrivalTime,
        WedDepartureTime,
        ThuArrivalTime,
        ThuDepartureTime,
        FriArrivalTime,
        FriDepartureTime,
        SatArrivalTime,
        SatDepartureTime,
        Instructions,
        MRCRequesterName,
        MRCRequesterPhone,
        MRCRequesterPhoneExt,
        MRCRequestDistrict,
        CONVERT(VARCHAR(10), MRCDateSubmitted, 120) as MRCDateSubmitted,
        MRCApprover,
        MRCApproverPhone,
        MRCApproverPhoneExt,
        CONVERT(VARCHAR(10), HSTDateREcived, 120) as HSTDateREcived,
        CONVERT(VARCHAR(10), HSTDateToBroker, 120) as HSTDateToBroker,
        HSTStaff,
        CONVERT(VARCHAR(10), MARTDateRecived, 120) as MARTDateRecived,
        CONVERT(VARCHAR(10), DateEmailSentToVendors, 120) as DateEmailSentToVendors,
        VendorContactInfo,
        VendorCode,
        OneWayTripCost,
        RoundTripCost,
        SharedRideCost,
        SharedRideWith,
        Comments,
        FormStatus
      FROM dbo.MRCTransForm
      ORDER BY MRCTransFormID DESC
    `);

    return NextResponse.json(result.recordset, { status: 200 });

  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime
    };

    console.error('[API] Error fetching submissions:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorDetails,
      message: `Failed to fetch submissions: ${errorDetails.message}`
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

export async function POST(req: Request) {
  let connection: sql.ConnectionPool | null = null;
  const startTime = Date.now();
  
  try {
    // Validate environment configuration
    validateConfig();
    
    // Log config for debugging (hide sensitive data)
    console.log('[API] Database config:', {
      server: config.server,
      database: config.database,
      user: config.user,
      hasPassword: !!config.password
    });

    connection = await new sql.ConnectionPool(config).connect();
    
    // Check if table exists
    const tableCheck = await connection.request().query(`
      SELECT OBJECT_ID('dbo.MRCTransForm') as TableID
    `);

    if (!tableCheck.recordset[0].TableID) {
      // Create table if it doesn't exist
      await connection.request().query(`
        CREATE TABLE dbo.MRCTransForm (
          MRCTransFormID INT IDENTITY(1,1) PRIMARY KEY,
          ServiceType NVARCHAR(255),
          StartDate DATE,
          EndDate DATE,
          ClientFName NVARCHAR(255),
          ClientLName NVARCHAR(255),
          ClientGender NVARCHAR(50),
          ClientLanguage NVARCHAR(100),
          ClientPhone NVARCHAR(50),
          ClientDOB DATE,
          ClientEmergencyContact NVARCHAR(255),
          ClientEmergencyPhone NVARCHAR(50),
          ClientEmergencyPhoneEXT NVARCHAR(20),
          PickUpAddress NVARCHAR(255),
          PickUpCity NVARCHAR(100),
          PickUpState NVARCHAR(50),
          PickUpZip NVARCHAR(20),
          TypeOfVehicle NVARCHAR(100),
          WCTypeSize NVARCHAR(100),
          Monitor BIT,
          DropOffFacilityName NVARCHAR(255),
          DropOffAddress NVARCHAR(255),
          DropOffCity NVARCHAR(100),
          DropOffState NVARCHAR(50),
          DropOffZip NVARCHAR(20),
          DropOffContact NVARCHAR(255),
          DropOffPhone NVARCHAR(50),
          DropOffPhoneEXT NVARCHAR(20),
          AltAddressFacilityName NVARCHAR(255),
          AltAddressCity NVARCHAR(100),
          AltAddressState NVARCHAR(50),
          AltAddressZip NVARCHAR(20),
          AltAddressContact NVARCHAR(255),
          AltAddressPhone NVARCHAR(50),
          AltAddressPhoneEXT NVARCHAR(20),
          SunArrivalTime TIME,
          SunDepartureTime TIME,
          MonArrivalTime TIME,
          MonDepartureTime TIME,
          TueArrivalTime TIME,
          TueDepartureTime TIME,
          WedArrivalTime TIME,
          WedDepartureTime TIME,
          ThuArrivalTime TIME,
          ThuDepartureTime TIME,
          FriArrivalTime TIME,
          FriDepartureTime TIME,
          SatArrivalTime TIME,
          SatDepartureTime TIME,
          Instructions NVARCHAR(MAX),
          MRCRequesterName NVARCHAR(255),
          MRCRequesterPhone NVARCHAR(50),
          MRCRequesterPhoneExt NVARCHAR(20),
          MRCRequestDistrict NVARCHAR(100),
          MRCDateSubmitted DATE,
          MRCApprover NVARCHAR(255),
          MRCApproverPhone NVARCHAR(50),
          MRCApproverPhoneExt NVARCHAR(20),
          HSTDateREcived DATE,
          HSTDateToBroker DATE,
          HSTStaff NVARCHAR(255),
          MARTDateRecived DATE,
          DateEmailSentToVendors DATE,
          VendorContactInfo NVARCHAR(MAX),
          VendorCode NVARCHAR(50),
          OneWayTripCost DECIMAL(10,2),
          RoundTripCost DECIMAL(10,2),
          SharedRideCost DECIMAL(10,2),
          SharedRideWith NVARCHAR(255),
          Comments NVARCHAR(MAX),
          FormStatus NVARCHAR(50) DEFAULT 'PENDING',
          CreatedAt DATETIME DEFAULT GETDATE(),
          LastModifiedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('[API] Created table MRCTransForm');
    }

    // Parse and validate request body
    const formData = await req.json();
    validateFormData(formData);
    
    // Parse day schedules
    const daySchedules = parseDaySchedules(formData);
    
    // Format schedule values for SQL
    const tueDayScheduled = daySchedules.TueArrivalTime;
    const tueDayScheduledFormatted = formatTimeForSql(daySchedules.TueArrivalTime);
    console.log('[API] TueArrivalTime debug:', {
      rawValue: tueDayScheduled,
      formattedValue: tueDayScheduledFormatted,
      valueType: typeof tueDayScheduledFormatted,
      isDate: tueDayScheduledFormatted instanceof Date,
      dateISOString: tueDayScheduledFormatted ? tueDayScheduledFormatted.toISOString() : null,
    });
    
    console.log('[API] Creating connection pool...', {
      server: config.server,
      database: config.database,
      timestamp: new Date().toISOString()
    });

    // Map form fields to database columns with validation
    const mappedData = {
      ServiceType: formData.fields.find((f: any) => f.label === 'Type of Service')?.value || 'N/A',
      StartDate: formatDateForSql(formData.fields.find((f: any) => f.label === 'Start Service')?.value || 'N/A'),
      EndDate: formatDateForSql(formData.fields.find((f: any) => f.label === 'End Service')?.value || 'N/A'),
      ClientFName: formData.fields.find((f: any) => f.label === 'First Name')?.value || 'N/A',
      ClientLName: formData.fields.find((f: any) => f.label === 'Last Name')?.value || 'N/A',
      ClientGender: formData.fields.find((f: any) => f.label === 'Gender')?.value || 'N/A',
      ClientLanguage: formData.fields.find((f: any) => f.label === 'Language')?.value || 'N/A',
      ClientPhone: formData.fields.find((f: any) => f.label === 'Phone')?.value || 'N/A',
      ClientDOB: formatDateForSql(formData.fields.find((f: any) => f.label === 'DOB')?.value || 'N/A'),
      ClientEmergencyContact: formData.fields.find((f: any) => f.label === 'Emergency Contact')?.value || 'N/A',
      ClientEmergencyPhone: formData.fields.find((f: any) => f.label === 'Emergency Phone')?.value || 'N/A',
      ClientEmergencyPhoneEXT: formData.fields.find((f: any) => f.label === 'Ext')?.value || 'N/A',
      PickUpAddress: formData.fields.find((f: any) => f.label === 'Address')?.value || 'N/A',
      PickUpCity: formData.fields.find((f: any) => f.label === 'City')?.value || 'N/A',
      PickUpState: formData.fields.find((f: any) => f.label === 'State')?.value || 'N/A',
      PickUpZip: formData.fields.find((f: any) => f.label === 'Zip Code')?.value || 'N/A',
      TypeOfVehicle: formData.fields.find((f: any) => f.label === 'Type of Vehicle')?.value || 'N/A',
      WCTypeSize: formData.fields.find((f: any) => f.label === 'Wheelchair Type & Size')?.value || 'N/A',
      Monitor: convertToBit(formData.fields.find((f: any) => f.label === 'Monitor')?.value || 'N/A'),
      
      // Dropoff location - need to check if these are after pickup fields
      DropOffFacilityName: formData.fields.find((f: any) => 
        f.label === 'Facility Name' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Monitor')
      )?.value || 'N/A',
      DropOffAddress: formData.fields.find((f: any) => 
        f.label === 'Address' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Facility Name')
      )?.value || 'N/A',
      DropOffCity: formData.fields.find((f: any) => 
        f.label === 'City' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Facility Name')
      )?.value || 'N/A',
      DropOffState: formData.fields.find((f: any) => 
        f.label === 'State' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Facility Name')
      )?.value || 'N/A',
      DropOffZip: formData.fields.find((f: any) => 
        f.label === 'Zip Code' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Facility Name')
      )?.value || 'N/A',
      DropOffContact: formData.fields.find((f: any) => 
        f.label === 'Contact Person' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Facility Name')
      )?.value || 'N/A',
      DropOffPhone: formData.fields.find((f: any) => 
        f.label === 'Phone' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Contact Person')
      )?.value || 'N/A',
      DropOffPhoneEXT: formData.fields.find((f: any) => 
        f.label === 'Ext' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Contact Person')
      )?.value || 'N/A',
      
      // Alternative address - need to find these after dropoff fields
      AltAddressFacilityName: 'N/A', // Not in the input list?
      AltAddressCity: formData.fields.find((f: any) => 
        f.label === 'City' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Ext' && formData.fields.indexOf(el) > formData.fields.findIndex((e: any) => e.label === 'Contact Person')
        )
      )?.value || 'N/A',
      AltAddressState: formData.fields.find((f: any) => 
        f.label === 'State' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Ext' && formData.fields.indexOf(el) > formData.fields.findIndex((e: any) => e.label === 'Contact Person')
        )
      )?.value || 'N/A',
      AltAddressZip: formData.fields.find((f: any) => 
        f.label === 'Zip Code' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Ext' && formData.fields.indexOf(el) > formData.fields.findIndex((e: any) => e.label === 'Contact Person')
        )
      )?.value || 'N/A',
      AltAddressContact: formData.fields.find((f: any) => 
        f.label === 'Contact Person' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Ext' && formData.fields.indexOf(el) > formData.fields.findIndex((e: any) => e.label === 'Contact Person')
        )
      )?.value || 'N/A',
      AltAddressPhone: formData.fields.find((f: any) => 
        f.label === 'Phone' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Contact Person' && 
          formData.fields.indexOf(el) > formData.fields.findIndex((e: any) => 
            e.label === 'Ext' && formData.fields.indexOf(e) > formData.fields.findIndex((x: any) => x.label === 'Contact Person')
          )
        )
      )?.value || 'N/A',
      AltAddressPhoneEXT: formData.fields.find((f: any) => 
        f.label === 'Ext' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Contact Person' && 
          formData.fields.indexOf(el) > formData.fields.findIndex((e: any) => 
            e.label === 'Ext' && formData.fields.indexOf(e) > formData.fields.findIndex((x: any) => x.label === 'Contact Person')
          )
        )
      )?.value || 'N/A',
      
      // Schedule information - use the parsed day schedules
      SunArrivalTime: formatTimeForSql(daySchedules.SunArrivalTime),
      SunDepartureTime: formatTimeForSql(daySchedules.SunDepartureTime),
      MonArrivalTime: formatTimeForSql(daySchedules.MonArrivalTime),
      MonDepartureTime: formatTimeForSql(daySchedules.MonDepartureTime),
      TueArrivalTime: formatTimeForSql(daySchedules.TueArrivalTime),
      TueDepartureTime: formatTimeForSql(daySchedules.TueDepartureTime),
      WedArrivalTime: formatTimeForSql(daySchedules.WedArrivalTime),
      WedDepartureTime: formatTimeForSql(daySchedules.WedDepartureTime),
      ThuArrivalTime: formatTimeForSql(daySchedules.ThuArrivalTime),
      ThuDepartureTime: formatTimeForSql(daySchedules.ThuDepartureTime),
      FriArrivalTime: formatTimeForSql(daySchedules.FriArrivalTime),
      FriDepartureTime: formatTimeForSql(daySchedules.FriDepartureTime),
      SatArrivalTime: formatTimeForSql(daySchedules.SatArrivalTime),
      SatDepartureTime: formatTimeForSql(daySchedules.SatDepartureTime),
      
      // Instructions - not in the input list but likely needed
      Instructions: formData.fields.find((f: any) => f.label === 'Instructions')?.value || 'N/A',
      
      // MRC Staff information
      MRCRequesterName: formData.fields.find((f: any) => f.label === 'Requester Name')?.value || 
                       formData.fields.find((f: any) => f.label.includes('ROXBURY Requester Name'))?.value || 'N/A',
      MRCRequesterPhone: formData.fields.find((f: any) => 
        f.label === 'Phone' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Requester Name' || el.label.includes('ROXBURY Requester Name')
        )
      )?.value || 'N/A',
      MRCRequesterPhoneExt: formData.fields.find((f: any) => 
        f.label === 'Ext' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => 
          el.label === 'Requester Name' || el.label.includes('ROXBURY Requester Name')
        )
      )?.value || 'N/A',
      MRCRequestDistrict: formData.fields.find((f: any) => f.label === 'DISTRICT')?.value || 
                         formData.fields.find((f: any) => f.label === 'Area Office')?.value || 'N/A',
      MRCDateSubmitted: new Date().toISOString().split('T')[0],
      
      // MRC Approval information
      MRCApprover: formData.fields.find((f: any) => f.label === 'Name of Authorized MRC Approver')?.value || 'Pending',
      MRCApproverPhone: formData.fields.find((f: any) => 
        f.label === 'Phone' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Name of Authorized MRC Approver')
      )?.value || 'Pending',
      MRCApproverPhoneExt: formData.fields.find((f: any) => 
        f.label === 'Ext' && 
        formData.fields.indexOf(f) > formData.fields.findIndex((el: any) => el.label === 'Name of Authorized MRC Approver')
      )?.value || 'Pending',
      
      // Status fields
      HSTDateREcived: null,
      HSTDateToBroker: null,
      HSTStaff: 'Pending',
      MARTDateRecived: null,
      DateEmailSentToVendors: null,
      VendorContactInfo: 'Pending',
      VendorCode: 'Pending',
      OneWayTripCost: 0.00,
      RoundTripCost: 0.00,
      SharedRideCost: 0.00,
      SharedRideWith: 'Pending',
      Comments: 'Pending',
      FormStatus: 'Submitted'
    };

    // Log the mapped data for debugging
    console.log('[API] Mapped data with exact field labels:', {
      fieldCount: Object.keys(mappedData).length,
      firstThreeFields: Object.entries(mappedData).slice(0, 3),
      dateFields: {
        StartDate: mappedData.StartDate,
        EndDate: mappedData.EndDate,
        ClientDOB: mappedData.ClientDOB,
        MRCDateSubmitted: mappedData.MRCDateSubmitted
      }
    });

    // Log mapped data for debugging
    console.log('[API] Mapped form data:', {
      fieldsCount: Object.keys(mappedData).length,
      sampleFields: Object.entries(mappedData).slice(0, 3)
    });

    // Create a list of fieldnames with their current values
    const fieldList = Object.keys(mappedData).map(key => {
      return { name: key, value: mappedData[key as keyof typeof mappedData] };
    });

    // Create request with transaction
    const transaction = new sql.Transaction(connection);
    await transaction.begin();
    const request = new sql.Request(transaction);
    
    console.log('[API] Building SQL query...');
    
    // Add parameters
    Object.entries(mappedData).forEach(([key, value]) => {
      console.log(`[API] Adding parameter: ${key} = ${value} (${typeof value})`);
      
      if (value === null) {
        // For required date fields, use today's date as fallback
        if (key === 'StartDate' || key === 'EndDate') {
          const today = new Date().toISOString().split('T')[0];
          console.log(`[API] Using default date for ${key}: ${today}`);
          request.input(key, sql.Date, today);
        } else {
          request.input(key, sql.NVarChar, null);
        }
      } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value);
      } else if (key === 'OneWayTripCost' || key === 'RoundTripCost' || key === 'SharedRideCost') {
        request.input(key, sql.Decimal(8, 2), value);
      } else if (key.includes('Time') && key !== 'Instructions') {
        // For time values, ensure they're treated correctly
        if (value === 'N/A') {
          request.input(key, sql.Time, null);
        } else {
          try {
            console.log(`[API] Processing TIME parameter "${key}":`, value);
            
            // For Date objects coming from formatTimeForSql
            if (value instanceof Date) {
              request.input(key, sql.Time, value);
            } else {
              // Fallback for any string values - convert to Date
              const today = new Date();
              const [hours, minutes] = value.split(':').map(Number);
              today.setHours(hours, minutes, 0, 0);
              request.input(key, sql.Time, today);
            }
          } catch (err) {
            console.error(`[API] Error setting TIME parameter "${key}":`, err);
            // Fallback to null if there's an error
            request.input(key, sql.Time, null);
          }
        }
      } else if (key.includes('Date') || key === 'StartDate' || key === 'EndDate' || key === 'ClientDOB') {
        try {
          console.log(`[API] Processing DATE parameter "${key}":`, value);
          
          // Make sure we have a valid date
          if (value === 'N/A' || !value) {
            const today = new Date().toISOString().split('T')[0];
            console.log(`[API] Using default date for ${key}: ${today}`);
            request.input(key, sql.Date, today);
          } else {
            // Handle date format for SQL
            request.input(key, sql.Date, value);
          }
        } catch (err) {
          console.error(`[API] Error setting DATE parameter "${key}":`, err);
          // Use today as fallback
          const today = new Date().toISOString().split('T')[0];
          request.input(key, sql.Date, today);
        }
      } else {
        request.input(key, sql.NVarChar, value);
      }
    });

    // Execute query with timeout
    const result = await Promise.race([
      request.query(`
        INSERT INTO dbo.MRCTransForm (
          ServiceType, StartDate, EndDate, ClientFName, ClientLName, ClientGender, ClientLanguage,
          ClientPhone, ClientDOB, ClientEmergencyContact, ClientEmergencyPhone, ClientEmergencyPhoneEXT,
          PickUpAddress, PickUpCity, PickUpState, PickUpZip, TypeOfVehicle, WCTypeSize, Monitor,
          DropOffFacilityName, DropOffAddress, DropOffCity, DropOffState, DropOffZip, DropOffContact,
          DropOffPhone, DropOffPhoneEXT, AltAddressFacilityName, AltAddressCity, AltAddressState,
          AltAddressZip, AltAddressContact, AltAddressPhone, AltAddressPhoneEXT, SunArrivalTime,
          SunDepartureTime, MonArrivalTime, MonDepartureTime, TueArrivalTime, TueDepartureTime,
          WedArrivalTime, WedDepartureTime, ThuArrivalTime, ThuDepartureTime, FriArrivalTime,
          FriDepartureTime, SatArrivalTime, SatDepartureTime, Instructions, MRCRequesterName,
          MRCRequesterPhone, MRCRequesterPhoneExt, MRCRequestDistrict, MRCDateSubmitted, MRCApprover,
          MRCApproverPhone, MRCApproverPhoneExt, HSTDateREcived, HSTDateToBroker, HSTStaff,
          MARTDateRecived, DateEmailSentToVendors, VendorContactInfo, VendorCode, OneWayTripCost,
          RoundTripCost, SharedRideCost, SharedRideWith, Comments, FormStatus
        ) VALUES (
          @ServiceType, @StartDate, @EndDate, @ClientFName, @ClientLName, @ClientGender, 
          @ClientLanguage, @ClientPhone, @ClientDOB, @ClientEmergencyContact, @ClientEmergencyPhone, 
          @ClientEmergencyPhoneEXT, @PickUpAddress, @PickUpCity, @PickUpState, @PickUpZip, 
          @TypeOfVehicle, @WCTypeSize, @Monitor, @DropOffFacilityName, @DropOffAddress, 
          @DropOffCity, @DropOffState, @DropOffZip, @DropOffContact, @DropOffPhone, 
          @DropOffPhoneEXT, @AltAddressFacilityName, @AltAddressCity, @AltAddressState, 
          @AltAddressZip, @AltAddressContact, @AltAddressPhone, @AltAddressPhoneEXT, 
          @SunArrivalTime, @SunDepartureTime, @MonArrivalTime, @MonDepartureTime, 
          @TueArrivalTime, @TueDepartureTime, @WedArrivalTime, @WedDepartureTime, 
          @ThuArrivalTime, @ThuDepartureTime, @FriArrivalTime, @FriDepartureTime, 
          @SatArrivalTime, @SatDepartureTime, @Instructions, @MRCRequesterName, 
          @MRCRequesterPhone, @MRCRequesterPhoneExt, @MRCRequestDistrict, @MRCDateSubmitted, 
          @MRCApprover, @MRCApproverPhone, @MRCApproverPhoneExt, @HSTDateREcived, 
          @HSTDateToBroker, @HSTStaff, @MARTDateRecived, @DateEmailSentToVendors, 
          @VendorContactInfo, @VendorCode, @OneWayTripCost, @RoundTripCost, 
          @SharedRideCost, @SharedRideWith, @Comments, @FormStatus
        );
        SELECT SCOPE_IDENTITY() AS InsertedId;
      `),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query execution timeout')), 30000)
      )
    ]) as SqlResult;

    // Commit transaction
    await transaction.commit();

    const executionTime = Date.now() - startTime;
    console.log('[API] Form submitted successfully', {
      executionTime,
      result
    });

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        insertedId: result.recordset?.[0]?.InsertedId,
        timestamp: new Date().toISOString(),
        executionTime
      }
    }, { status: 200 });

  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined,
      sqlState: (error as any)?.originalError?.info?.state,
      sqlMessage: (error as any)?.originalError?.info?.message,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime
    };

    console.error('[API] Error details:', JSON.stringify(errorDetails, null, 2));

    return NextResponse.json({
      success: false,
      error: errorDetails,
      message: `Failed to submit form: ${errorDetails.message}`
    }, { status: 500 });

  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('[API] Connection closed successfully');
      } catch (err) {
        console.error('[API] Error closing connection:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}