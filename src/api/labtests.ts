import {
    CRMFetchCommonTestNameDetailsRequest, CRMFetchCommonTestNameDetailsResponse, HealthPackage, FetchHealthPackagesRequest
    , CRMFetchTestDetailsBasedUponCommonTestNameRequest, CRMFetchTestDetailsBasedUponCommonTestNameResponse, CRMLoadDCDetailsRequest, CRMLoadDCDetailsResponse,
    CrmDcTestPricesResponse, ThyrocareLoginRequest, ThyrocareLoginResponse, ThyrocareOrderBookingRequest, ThyrocareOrderBookingResponse, OrangeHealthCreateOrderRequest, OrangeHealthCreateOrderResponse,
    SRLOrderSendTestUpdateRequest,
    SRLOrderSendTestUpdateResponse, DiagnosticCenterSearchRequest, DiagnosticCenterDetailed, VisitType, FilterDiagnosticCenterParams,
    HealthPackageChoice, APIHealthPackage, SponsoredPackage,
    AddToCartRequest, AddPackageToCartRequest, AppointmentCartResponse, AppointmentCartItem
} from "../types/labtests";
import { api } from "../services/api";

const API_URL = process.env.REACT_APP_API_URL || "";

/**
 * Helper to extract an array from potentially nested or paginated API responses.
 */
const extractArray = <T>(data: any): T[] => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
};

// Helper to map new DiagnosticCenterDetailed to legacy CRMLoadDCDetailsResponse
export const mapDCToLegacy = (dc: DiagnosticCenterDetailed): CRMLoadDCDetailsResponse => {
    // Basic mapping for visit types if available
    let visitTypeName = 'Center';
    if (dc.visit_types && dc.visit_types.length > 0) {
        // 1 typically Home, 2 Center
        if (dc.visit_types.includes(1) && dc.visit_types.includes(2)) visitTypeName = 'Home/Center';
        else if (dc.visit_types.includes(1)) visitTypeName = 'Home';
        else if (dc.visit_types.includes(2)) visitTypeName = 'Center';
    }

    return {
        dc_id: dc.id || 0,
        sptoken_id: dc.code || '',
        center_name: dc.name,
        city: dc.city || 0,
        DistrictName: dc.area || '',
        address: dc.address,
        area: dc.area,
        Locality: dc.area,
        service_pincode: dc.pincode,
        ISO_Type: '',
        VisitType: visitTypeName,
        VisitTypeId: (dc.visit_types && dc.visit_types[0]) || 2,
        TestName: '',
        TestId: '',
        DCUniqueName: dc.name,
        DC_Distance: 'N/A',
        Duration: 'N/A',
        tests: dc.tests || []
    };
};

export const labTestsAPI = {

    // 1. tests API - GET {{baseURL}}/api/labtest/tests/
    fetchCommonTestNameDetails: async (request: CRMFetchCommonTestNameDetailsRequest): Promise<CRMFetchCommonTestNameDetailsResponse[] | null> => {
        try {
            const response = await api.get('/api/labtest/tests/');
            return extractArray<CRMFetchCommonTestNameDetailsResponse>(response.data);
        } catch (error) {
            console.error("fetchCommonTestNameDetails failed:", error);
            return null;
        }
    },

    // 2. diagnostic centers API - GET {{baseURL}}/api/diagnostic-center/
    fetchDiagnosticCenters: async (): Promise<DiagnosticCenterDetailed[] | null> => {
        try {
            const response = await api.get('/api/diagnostic-center/');
            return extractArray<DiagnosticCenterDetailed>(response.data);
        } catch (error) {
            console.error("fetchDiagnosticCenters failed:", error);
            return null;
        }
    },

    // 3-8. Lab Filter APIs - GET {{baseURL}}/api/labfilter/diagnostic-center/search
    filterDiagnosticCenters: async (params: FilterDiagnosticCenterParams): Promise<DiagnosticCenterDetailed[] | null> => {
        try {
            const queryParams = new URLSearchParams();
            if (params.area) queryParams.append("area", params.area);
            if (params.pincode) queryParams.append("pincode", params.pincode);
            if (params.name) queryParams.append("name", params.name);
            if (params.visit_type) queryParams.append("visit_type", params.visit_type.toString());
            if (params.sort_price) queryParams.append("sort_price", params.sort_price);

            const response = await api.get(`/api/labfilter/diagnostic-center/search?${queryParams.toString()}`);
            return extractArray<DiagnosticCenterDetailed>(response.data);
        } catch (error) {
            console.error("filterDiagnosticCenters failed:", error);
            return null;
        }
    },

    // 9. visit types API - GET {{baseURL}}/api/labfilter/visit-types/
    fetchVisitTypes: async (): Promise<VisitType[] | null> => {
        try {
            const response = await api.get('/api/labfilter/visit-types/');
            return extractArray<VisitType>(response.data);
        } catch (error) {
            console.error("fetchVisitTypes failed:", error);
            return null;
        }
    },

    // 10. search diagnostic center API - GET {{baseURL}}/api/diagnostic-center/search/
    searchDiagnosticCenters: async (request: DiagnosticCenterSearchRequest): Promise<DiagnosticCenterDetailed[] | null> => {
        try {
            const queryParams = new URLSearchParams();
            if (request.city_id) queryParams.append("city_id", request.city_id.toString());
            if (request.test_ids && request.test_ids.length > 0) {
                queryParams.append("test_ids", request.test_ids.join(","));
            }
            if (request.health_package_id) queryParams.append("health_package_id", request.health_package_id.toString());
            if (request.sponsored_package_id) queryParams.append("sponsored_package_id", request.sponsored_package_id.toString());
            if (request.pincode) queryParams.append("pincode", request.pincode);
            if (request.area) queryParams.append("area", request.area);
            if (request.name) queryParams.append("name", request.name);
            if (request.visit_type) queryParams.append("visit_type", request.visit_type.toString());

            const response = await api.get<DiagnosticCenterDetailed[]>(`/api/diagnostic-center/search/?${queryParams.toString()}`);
            return extractArray<DiagnosticCenterDetailed>(response.data);
        } catch (error) {
            console.error("searchDiagnosticCenters failed:", error);
            return null;
        }
    },

    // 11. health package choices API - GET {{baseURL}}/api/health-packages/choices/
    fetchHealthPackageChoices: async (): Promise<HealthPackageChoice[] | null> => {
        try {
            const response = await api.get('/api/health-packages/choices/');
            return extractArray<HealthPackageChoice>(response.data);
        } catch (error) {
            console.error("fetchHealthPackageChoices failed:", error);
            return null;
        }
    },

    // 12. health packages by type API - GET {{baseURL}}/api/health-packages/packages/
    fetchHealthPackagesByType: async (packageType: string): Promise<APIHealthPackage[] | null> => {
        try {
            // User requested to remove query param: /api/health-packages/packages/
            const response = await api.get(`/api/health-packages/packages/`);
            return extractArray<APIHealthPackage>(response.data);
        } catch (error) {
            console.error("fetchHealthPackagesByType failed:", error);
            return null;
        }
    },

    // 13. sponsored packages API - GET {{baseURL}}/api/sponsored-packages/packages/
    fetchSponsoredPackages: async (): Promise<SponsoredPackage[] | null> => {
        try {
            const response = await api.get('/api/sponsored-packages/packages/');
            return extractArray<SponsoredPackage>(response.data);
        } catch (error) {
            console.error("fetchSponsoredPackages failed:", error);
            return null;
        }
    },

    // Legacy / Other APIs
    fetchHealthPackages: async (request: FetchHealthPackagesRequest): Promise<APIHealthPackage[] | null> => {
        try {
            const response = await api.get('/api/health-packages/packages/');
            return extractArray<APIHealthPackage>(response.data);
        } catch (error) {
            console.error("fetchHealthPackages failed:", error);
            return null;
        }
    },
    CRMFetchTestDetailsBasedUponCommonTestName: async (request: CRMFetchTestDetailsBasedUponCommonTestNameRequest): Promise<CRMFetchTestDetailsBasedUponCommonTestNameResponse[] | null> => {
        try {
            // Use the new tests API with search and ensure correct path
            const response = await api.get(`/api/labtest/tests/?search=${encodeURIComponent(request.CommonTestName)}`);
            const tests = extractArray<any>(response.data);

            // Map to legacy format { TestId, TestName }
            return tests.map(test => ({
                TestId: test.id || test.TestId,
                TestName: test.name || test.TestName,
                CorporatePrice: test.price || test.CorporatePrice || test.mrp || 0,
                NormalPrice: test.mrp || test.NormalPrice || test.price || 0
            }));
        } catch (error) {
            console.error("CRMFetchTestDetailsBasedUponCommonTestName failed:", error);
            return null;
        }
    },

    CRMLoadDCDetails: async (request: CRMLoadDCDetailsRequest): Promise<CRMLoadDCDetailsResponse[] | null> => {
        try {
            // First try specialized search center API
            const searchRequest: DiagnosticCenterSearchRequest = {
                city_id: request.CityId,
                test_ids: request.TestId.split(',').map(Number).filter(id => !isNaN(id)),
                pincode: request.PinCode,
                area: request.Area,
                // name: request.CommonTestName, // REMOVED: This filters by DC name, not Test Name
            };

            const newData = await labTestsAPI.searchDiagnosticCenters(searchRequest);
            if (newData && newData.length > 0) {
                return newData.map(mapDCToLegacy);
            }

            // FALLBACK: If search returns nothing, try fetching all centers
            const allCenters = await labTestsAPI.fetchDiagnosticCenters();
            if (allCenters && allCenters.length > 0) {
                const requestedTestIds = searchRequest.test_ids || [];
                const filtered = allCenters.filter(dc => {
                    const dcTests = (dc.tests || []).map(Number);
                    return requestedTestIds.length === 0 || requestedTestIds.some(id => dcTests.includes(id));
                });

                if (filtered.length > 0) {
                    return filtered.map(mapDCToLegacy);
                }
            }

            return [];
        } catch (error) {
            console.error("CRMLoadDCDetails failed:", error);
            return null;
        }
    },



    ThyrocareLogin: async (request: ThyrocareLoginRequest): Promise<ThyrocareLoginResponse | null> => {
        try {
            // Re-implementing with specialized request as seen in some versions
            const response = await api.post<ThyrocareLoginResponse>('/ThyrocareLogin', {
                username: request.username || "9895495477",
                password: request.password || "5B2B35",
                portalType: "",
                userType: "DSA"
            });
            const data = response.data;
            if (data.status && data.accessToken) {
                localStorage.setItem('thyrocare_access_token', data.accessToken);
                localStorage.setItem('thyrocare_api_key', data.apiKey || '');
            }
            return data;
        } catch (error) {
            console.error("ThyrocareLogin failed:", error);
            return null;
        }
    },

    ThyrocareOrderBooking: async (request: ThyrocareOrderBookingRequest): Promise<ThyrocareOrderBookingResponse | null> => {
        try {
            const response = await api.post<ThyrocareOrderBookingResponse>('/ThyrocareOrderBooking', request);
            return response.data;
        } catch (error) {
            console.error("ThyrocareOrderBooking failed:", error);
            return null;
        }
    },

    OrangeHealthCreateOrder: async (request: OrangeHealthCreateOrderRequest): Promise<OrangeHealthCreateOrderResponse | null> => {
        try {
            const response = await api.post<OrangeHealthCreateOrderResponse>('/OrangeHealthCreateOrder', request);
            return response.data;
        } catch (error) {
            console.error("OrangeHealthCreateOrder failed:", error);
            return null;
        }
    },

    SRLOrderSendTestUpdate: async (request: SRLOrderSendTestUpdateRequest): Promise<SRLOrderSendTestUpdateResponse | null> => {
        try {
            const response = await api.post<SRLOrderSendTestUpdateResponse>('/SRLOrderSendTestUpdate', request);
            return response.data;
        } catch (error) {
            console.error("SRLOrderSendTestUpdate failed:", error);
            return null;
        }
    },

    // New Appointment & Cart APIs from Postman
    addToCart: async (request: AddToCartRequest): Promise<any | null> => {
        try {
            const response = await api.post('/api/appointments/add-to-cart/', request);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                console.warn("Item already in cart (409):", error.response.data);
                return { success: true, message: "Item already in cart", alreadyExists: true, data: error.response.data };
            }
            console.error("addToCart failed:", error.response?.data || error.message);
            return null;
        }
    },

    clearDiagnosticCart: async (): Promise<boolean> => {
        try {
            const cart = await labTestsAPI.viewCart();
            if (cart && cart.items && cart.items.length > 0) {
                // Filter items that look like diagnostic tests (usually have test_ids or specific fields)
                // The API might not have a 'type' field yet, so we check for diagnostic center or tests
                const diagnosticItems = cart.items.filter((item: any) =>
                    item.diagnostic_center ||
                    item.diagnostic_center_name ||
                    (item.tests && item.tests.length > 0)
                );

                console.log(`Clearing ${diagnosticItems.length} diagnostic items from cart...`);
                for (const item of diagnosticItems) {
                    await labTestsAPI.removeCartItem(item.id);
                }
            }
            return true;
        } catch (error) {
            console.error("clearDiagnosticCart failed:", error);
            return false;
        }
    },

    addPackageToCart: async (request: AddPackageToCartRequest): Promise<any | null> => {
        try {
            const response = await api.post('/api/appointments/add-package-to-cart/', request);
            return response.data;
        } catch (error) {
            console.error("addPackageToCart failed:", error);
            return null;
        }
    },

    viewCart: async (): Promise<AppointmentCartResponse | null> => {
        try {
            const response = await api.get<AppointmentCartResponse>('/api/appointments/cart/');
            return response.data;
        } catch (error) {
            console.error("viewCart failed:", error);
            return null;
        }
    },

    removeCartItem: async (itemId: number): Promise<boolean> => {
        try {
            await api.delete(`/api/appointments/cart/item/${itemId}/remove/`);
            return true;
        } catch (error) {
            console.error("removeCartItem failed:", error);
            return false;
        }
    },

    checkout: async (cartId: number): Promise<any | null> => {
        try {
            const response = await api.post(`/api/appointments/cart/${cartId}/checkout/`);
            return response.data;
        } catch (error) {
            console.error("checkout failed:", error);
            return null;
        }
    }
};
