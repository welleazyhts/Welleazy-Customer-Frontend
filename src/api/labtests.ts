import { request } from "axios";
import { CRMFetchCommonTestNameDetailsRequest, CRMFetchCommonTestNameDetailsResponse,HealthPackage,FetchHealthPackagesRequest
    ,CRMFetchTestDetailsBasedUponCommonTestNameRequest,CRMFetchTestDetailsBasedUponCommonTestNameResponse,CRMLoadDCDetailsRequest,CRMLoadDCDetailsResponse,
    CrmDcTestPricesResponse,ThyrocareLoginRequest,ThyrocareLoginResponse,ThyrocareOrderBookingRequest,ThyrocareOrderBookingResponse,OrangeHealthCreateOrderRequest,OrangeHealthCreateOrderResponse,
    SRLOrderSendTestUpdateRequest,
    SRLOrderSendTestUpdateResponse
 } from "../types/labtests";   
 
const API_URL = " https://api.welleazy.com";
 export const labTestsAPI = {
    
    fetchCommonTestNameDetails: async (request: CRMFetchCommonTestNameDetailsRequest): Promise<CRMFetchCommonTestNameDetailsResponse[] | null> => {
        try {
            const response = await fetch(`${API_URL}/CRMFetchCommonTestNameDetails`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Fetching common test name details failed:", error);
            return null;
        }
    },
    fetchHealthPackages: async (request: FetchHealthPackagesRequest):Promise<HealthPackage[] | null> => {
        try {
            const response = await fetch(`${API_URL}/CRMCustomerMyPlanDetails`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Fetching health packages failed:", error);
            return null;
        }
    },
    CRMFetchTestDetailsBasedUponCommonTestName: async (request: CRMFetchTestDetailsBasedUponCommonTestNameRequest): Promise<CRMFetchTestDetailsBasedUponCommonTestNameResponse[] | null> => {
        try {
            const response = await fetch(`${API_URL}/CRMFetchTestDetailsBasedUponCommonTestName`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Fetching test details based upon common test name failed:", error);
            return null;
        }
    },
    CRMLoadDCDetails: async (request: CRMLoadDCDetailsRequest): Promise<CRMLoadDCDetailsResponse[] | null> => {
        try {
            const response = await fetch(`${API_URL}/CRMLoadDCDetails`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Loading DC details failed:", error);
            return null;
        }
    },
    DCTestPrice: async (request: CRMLoadDCDetailsRequest): Promise<CrmDcTestPricesResponse[] | null> => {
    try {
        const response = await fetch(`${API_URL}/DCTestPrice`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data: CrmDcTestPricesResponse[] = await response.json();
        return data;
    } catch (error) {
        console.error("Loading DC details failed:", error);
        return null;
    }
    },
    ThyrocareLogin: async (request: ThyrocareLoginRequest): Promise<ThyrocareLoginResponse | null> => {
        try {
            const response = await fetch(`${API_URL}/ThyrocareLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "9895495477",
                    password: "5B2B35",
                    portalType: "",
                    userType: "DSA"
                })
            });

            if (!response.ok) {
                throw new Error(`Thyrocare login failed: ${response.status} ${response.statusText}`);
            }

            const data: ThyrocareLoginResponse = await response.json();            
            if (data.status && data.accessToken) {
                localStorage.setItem('thyrocare_access_token', data.accessToken);
                localStorage.setItem('thyrocare_api_key', data.apiKey);
                localStorage.setItem('thyrocare_user_info', JSON.stringify({
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    userType: data.userType,
                    dsaWebLink: data.dsaWebLink
                }));
            }
            
            return data;
        } catch (error) {
            console.error("Thyrocare login failed:", error);
            return null;
        }
    },
    ThyrocareOrderBooking: async (request: ThyrocareOrderBookingRequest): Promise<ThyrocareOrderBookingResponse | null> => {
        try {
           
            const response = await fetch(`${API_URL}/ThyrocareOrderBooking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`Thyrocare order booking failed: ${response.status} ${response.statusText}`);
            }

            const data: ThyrocareOrderBookingResponse = await response.json();
            console.log("Thyrocare order booking response:", data);
            
            if (data.response === "Order Placed Successfully") {
                localStorage.setItem('last_thyrocare_order', JSON.stringify({
                    orderNo: data.orderNo,
                    refOrderId: data.refOrderId,
                    product: data.product,
                    status: data.status,
                    date: new Date().toISOString()
                }));
            }
            
            return data;
        } catch (error) {
            console.error("Thyrocare order booking failed:", error);
            return null;
        }
    },
    OrangeHealthCreateOrder: async (request: OrangeHealthCreateOrderRequest): Promise<OrangeHealthCreateOrderResponse | null> => {
    try {
        const response = await fetch(`${API_URL}/OrangeHealthCreateOrder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`OrangeHealth order creation failed: ${response.status} ${response.statusText}`);
        }
        const data: OrangeHealthCreateOrderResponse = await response.json();         
        return data;
    } catch (error) {
        console.error("OrangeHealth order creation failed:", error);
        return null;
    }
    },
    SRLOrderSendTestUpdate: async (request: SRLOrderSendTestUpdateRequest): Promise<SRLOrderSendTestUpdateResponse | null> => {
     try 
     {
        const response = await fetch(`${API_URL}/SRLOrderSendTestUpdate`,
    {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      throw new Error(
        `SRL order update failed: ${response.status} ${response.statusText}`
      );
    }

    const data: SRLOrderSendTestUpdateResponse = await response.json();
    return data;
  } catch (error) {
    console.error("SRL order update failed:", error);
    return null;
  }
    }
 

};