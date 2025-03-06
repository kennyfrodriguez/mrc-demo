export interface MRCTransForm {
  MRCTransFormID: string
  ServiceType: string
  StartDate: string
  EndDate: string
  ClientFName: string
  ClientLName: string
  ClientGender: string
  ClientLanguage: string
  ClientPhone: string
  ClientDOB: string
  ClientEmergencyContact: string
  ClientEmergencyPhone: string
  ClientEmergencyPhoneEXT?: string
  PickUpAddress: string
  PickUpCity: string
  PickUpState: string
  PickUpZip: string
  TypeOfVehicle: string
  WCTypeSize?: string
  Monitor: boolean
  DropOffFacilityName: string
  DropOffAddress: string
  DropOffCity: string
  DropOffState: string
  DropOffZip: string
  DropOffContact: string
  DropOffPhone: string
  DropOffPhoneEXT?: string
  AltAddressFacilityName?: string
  AltAddressCity?: string
  AltAddressState?: string
  AltAddressZip?: string
  AltAddressContact?: string
  AltAddressPhone?: string
  AltAddressPhoneEXT?: string
  SunArrivalTime?: string
  SunDepartureTime?: string
  MonArrivalTime?: string
  MonDepartureTime?: string
  TueArrivalTime?: string
  TueDepartureTime?: string
  WedArrivalTime?: string
  WedDepartureTime?: string
  ThuArrivalTime?: string
  ThuDepartureTime?: string
  FriArrivalTime?: string
  FriDepartureTime?: string
  SatArrivalTime?: string
  SatDepartureTime?: string
  Instructions?: string
  MRCRequesterName: string
  MRCRequesterPhone: string
  MRCRequesterPhoneExt?: string
  MRCRequestDistrict: string
  MRCDateSubmitted: string
  MRCApprover: string
  MRCApproverPhone: string
  MRCApproverPhoneExt?: string
  HSTDateREcived?: string
  HSTDateToBroker?: string
  HSTStaff?: string
  MARTDateRecived?: string
  DateEmailSentToVendors?: string
  VendorContactInfo?: string
  VendorCode?: string
  OneWayTripCost?: number
  RoundTripCost?: number
  SharedRideCost?: number
  SharedRideWith?: string
  Comments?: string
  FormStatus: string
}

export const MOCK_TRIPS: MRCTransForm[] = [
  {
    MRCTransFormID: '1',
    ServiceType: 'Medical Transport',
    StartDate: '2024-03-01',
    EndDate: '2024-12-31',
    ClientFName: 'John',
    ClientLName: 'Doe',
    ClientGender: 'Male',
    ClientLanguage: 'English',
    ClientPhone: '555-1234',
    ClientDOB: '1980-05-15',
    ClientEmergencyContact: 'Jane Doe',
    ClientEmergencyPhone: '555-5678',
    PickUpAddress: '123 Main St',
    PickUpCity: 'Springfield',
    PickUpState: 'MA',
    PickUpZip: '01103',
    TypeOfVehicle: 'Wheelchair Van',
    Monitor: true,
    DropOffFacilityName: 'Springfield Medical Center',
    DropOffAddress: '456 Elm St',
    DropOffCity: 'Springfield',
    DropOffState: 'MA',
    DropOffZip: '01105',
    DropOffContact: 'Dr. Smith',
    DropOffPhone: '555-6789',
    MRCRequesterName: 'John Doe',
    MRCRequesterPhone: '555-1234',
    MRCRequestDistrict: 'Springfield',
    MRCDateSubmitted: '2024-02-15',
    MRCApprover: 'Dr. Johnson',
    MRCApproverPhone: '555-9876',
    FormStatus: 'PENDING'
  },
  {
    MRCTransFormID: '2',
    ServiceType: 'Medical Transport',
    StartDate: '2024-03-05',
    EndDate: '2024-12-31',
    ClientFName: 'Sarah',
    ClientLName: 'Williams',
    ClientGender: 'Female',
    ClientLanguage: 'English',
    ClientPhone: '555-2468',
    ClientDOB: '1975-08-22',
    ClientEmergencyContact: 'Tom Williams',
    ClientEmergencyPhone: '555-1357',
    PickUpAddress: '789 Oak St',
    PickUpCity: 'Springfield',
    PickUpState: 'MA',
    PickUpZip: '01104',
    TypeOfVehicle: 'Sedan',
    Monitor: false,
    DropOffFacilityName: 'City Medical Center',
    DropOffAddress: '321 Pine St',
    DropOffCity: 'Springfield',
    DropOffState: 'MA',
    DropOffZip: '01108',
    DropOffContact: 'Dr. Brown',
    DropOffPhone: '555-4321',
    MRCRequesterName: 'Sarah Williams',
    MRCRequesterPhone: '555-2468',
    MRCRequestDistrict: 'Springfield',
    MRCDateSubmitted: '2024-02-20',
    MRCApprover: 'Dr. Anderson',
    MRCApproverPhone: '555-8765',
    FormStatus: 'PENDING'
  },
  {
    MRCTransFormID: '3',
    ServiceType: 'Medical Transport',
    StartDate: '2024-03-10',
    EndDate: '2024-12-31',
    ClientFName: 'Robert',
    ClientLName: 'Martinez',
    ClientGender: 'Male',
    ClientLanguage: 'Spanish',
    ClientPhone: '555-3698',
    ClientDOB: '1990-03-15',
    ClientEmergencyContact: 'Maria Martinez',
    ClientEmergencyPhone: '555-7412',
    PickUpAddress: '456 Maple Ave',
    PickUpCity: 'Springfield',
    PickUpState: 'MA',
    PickUpZip: '01109',
    TypeOfVehicle: 'Wheelchair Van',
    Monitor: true,
    DropOffFacilityName: 'Rehabilitation Center',
    DropOffAddress: '789 Cedar St',
    DropOffCity: 'Springfield',
    DropOffState: 'MA',
    DropOffZip: '01107',
    DropOffContact: 'Dr. Garcia',
    DropOffPhone: '555-9512',
    MRCRequesterName: 'Robert Martinez',
    MRCRequesterPhone: '555-3698',
    MRCRequestDistrict: 'Springfield',
    MRCDateSubmitted: '2024-02-25',
    MRCApprover: 'Dr. Rodriguez',
    MRCApproverPhone: '555-7530',
    FormStatus: 'AWARDED'
  }
]

export const MOCK_VENDORS = [
  {
    id: '1',
    name: 'HealthTrans Express',
    contact: 'John Smith',
    phone: '555-1111',
    email: 'info@healthtrans.com'
  },
  {
    id: '2',
    name: 'MediRide Solutions',
    contact: 'Sarah Johnson',
    phone: '555-2222',
    email: 'contact@mediride.com'
  },
  {
    id: '3',
    name: 'CarePlus Transport',
    contact: 'Mike Wilson',
    phone: '555-3333',
    email: 'service@careplus.com'
  },
  {
    id: '4',
    name: 'Swift Medical Transit',
    contact: 'Lisa Brown',
    phone: '555-4444',
    email: 'dispatch@swiftmedical.com'
  }
]

export interface Bid {
  vendorId: string
  amount: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
}

export const MOCK_BIDS: Record<string, Bid[]> = {
  '1': [
    {
      vendorId: '1',
      amount: '150.00',
      status: 'PENDING',
      submittedAt: '2024-02-16T10:30:00Z'
    },
    {
      vendorId: '2',
      amount: '175.00',
      status: 'PENDING',
      submittedAt: '2024-02-16T11:45:00Z'
    },
    {
      vendorId: '3',
      amount: '145.00',
      status: 'PENDING',
      submittedAt: '2024-02-16T14:20:00Z'
    }
  ],
  '2': [
    {
      vendorId: '2',
      amount: '85.00',
      status: 'PENDING',
      submittedAt: '2024-02-21T09:15:00Z'
    },
    {
      vendorId: '4',
      amount: '95.00',
      status: 'PENDING',
      submittedAt: '2024-02-21T10:30:00Z'
    }
  ],
  '3': [
    {
      vendorId: '1',
      amount: '165.00',
      status: 'APPROVED',
      submittedAt: '2024-02-26T08:45:00Z'
    },
    {
      vendorId: '3',
      amount: '180.00',
      status: 'REJECTED',
      submittedAt: '2024-02-26T09:30:00Z'
    },
    {
      vendorId: '4',
      amount: '170.00',
      status: 'REJECTED',
      submittedAt: '2024-02-26T11:15:00Z'
    }
  ]
} 