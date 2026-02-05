export interface PharmacyProductList {
    OneMGSearchAllResultDetailsId: number;
    Name: string;
    Type: string;
    Tag: string;
    Available: boolean;
    Ratings: string;
    Label: string;
    Ratings1: string;
    Image: string;
    MRP: string;
    SortMRP: number;
    DiscountedPrice: string;
    Discount: string;
    SKUId: string;
    ImgLogo: string;

  PillowProduct?: boolean;
  Manufacturer?: string;
  DosageType?: string;
  PackSize?: string;
  PopularityScore?: number;

    vendor?: '1mg' | 'pillo';
}

export interface SearchPharmacyProductList {
    id: string;
    name: string;
    type: string;
    tag: {
        text: string;
        bg_color: string;
    } | null;
    available: boolean;
    ratings: string | null;
    label: string;
    image: string;
    prices: {
        mrp: string;
        discounted_price: string;
        discount: string;
    };
    sale: any;
    cta: {
        text: string;
        action: string;
        details: {
            sku_id: string;
            quantity: number;
        };
    };
    quantity_info: {
        min: number;
        max: number;
        selling_quantity: number;
        display_text: string | null;
        know_more: string | null;
    };
    rx_required: boolean;
    is_infant: boolean;
}

export interface SearchAllResponse {
    data: {
        term: string;
        scroll_id: string;
        previous_scroll_id: string | null;
        result_found: boolean;
        search_results: SearchPharmacyProductList[];
    };
}

export interface CouponRequest {
    ApolloId: number;
    ApolloSKU: string;
    Relation: number;
    Name: string;
    ContactNo: string;
    Email: string;
    State: number;
    City: number;
    Address: string;
    CouponName: string;
    CreatedBy: number;
    MedicineName: string;
    prescriptionFile?: File;
}

export interface CouponResponse {
    Success: boolean;
    ApolloId?: number;
    CouponCode?: string;
    SKUCode?: string;
    Message: string;
}

export interface InventoryCheckRequest {
  SkuId: string;
  Quantity: number;
  FirstName: string;
  Mobile: string;
  Email: string;
}
export interface VASCharge {
  amount: number;
  display_text: string;
  type: string;
}

export interface VASCharges {
  details: VASCharge[];
  total_amount: number;
}

export interface SkuInventory {
  offered_price: number;
  quantity: number;
  discounted_price: number;
  min_order_qty: number;
  price: number;
}

export interface SkusInventory {
  [skuId: string]: SkuInventory;
}

export interface InventoryCheckData {
  eta: string | null;
  payable_amount: number;
  vas_charges: VASCharges;
  skus: SkusInventory;
}

export interface InventoryCheckResponse {
  data: InventoryCheckData;
  partial_complete: boolean;
  is_success: boolean;
  status_code: number;
}

export interface OneMGGenerateOrderRequest {
  EmployeeRefId: string;
  CartUniqueId: string;
  LoginRefId: string;
  PharmacyOrderId: string;
  PayableAmount: string;
  EmailId: string;
  MobileNo: string;
  CustomerName: string;
  Pincode: string;
  Address: string;
  PharmacyCartDetailsId?: string; 
}

export interface OneMGGenerateOrderResponse {
  Message: string;
  OrderId?: string;
  Success?: boolean;
  Status?: string;
}
export interface CartItem {
  OneMGSearchAllResultDetailsId: string;
  name: string;
  img?: string;
  MRP?: string;
  DiscountedPrice?: string;
  Discount?: string;
  Available?: boolean;
  quantity: number;
  price: number;
  inventoryData?: any;
  PharmacyCartDetailsId?: number;
  totalPayable?: number;
  cartId?: string;
  vendor?: '1mg' | 'pillo';
  packSize?: string;
  manufacturer?: string;
  brandName?: string;
  dosageType?: string;
  isRxRequired?: boolean;
}
export interface VASCharge {
  amount: number;
  display_text: string;
  type: string;
}

export interface InventoryResult {
  itemId: string;
  inventoryData: any | null;
  success: boolean;
}

export interface StoredProductDetails {
  id: string;
  name: string;
  mrp: number;
  discountedPrice: number;
  discount: number;
  image: string;
   vendorType?: '1mg' | 'pillo'; 
}

export interface ProductDetailsOverview {
  sku: {
    id: number;
    name: string;
    images: Array<{
      thumbnail: string;
      low: string;
      medium: string;
      high: string;
      mediumhigh: string;
    }>;
    manufacturer: {
      name: string | null;
    };
    marketer: {
      name: string;
    };
    storage_condition: {
      display_text: string;
    };
    therapeutic_class: string;
  };
  composition: {
    name: string;
    strength: {
      display_text: string;
    };
    uses: {
      display_text: string;
    };
    mechanism_of_action: {
      display_text: string;
    };
    side_effects: {
      display_text: string;
    };
    how_to_take: {
      display_text: string;
    };
    introduction: {
      display_text: string;
    };
    benefits: {
      display_text: string;
    };
    faqs: {
      data: Array<{
        question: string;
        answer: string;
      }>;
    };
    expert_advice: {
      display_text: string;
    };
  };
  safety_advice: {
    data: Array<{
      display_text: string;
      description: string;
      tag: {
        text: string;
        bg_color: string;
      };
    }>;
  };
  medicine_interaction: {
    values: Array<{
      severity: string;
      drug: {
        name: string;
      };
      custom_experience: string;
    }>;
  };
}

// Add these to your existing types/Pharmacy.ts file

export interface DrugStaticRequest {
  sku_id: string;
  client: string;
  locale: string;
}

export interface DrugStaticResponse {
  is_success: boolean;
  data: ProductDetailsData;
  partial_complete: boolean;
  status_code: number;
}
export interface ProductDetailsData {
  available_languages: AvailableLanguage[];
  composition: Composition; 
  related_articles: RelatedArticles;
  last_updated_info: LastUpdatedInfo;
  trust_badges: TrustBadge[];
  trust_badges_bg_color: string;
  sku: Sku;
  footer_data: FooterData;
  safety_advice: SafetyAdvice;
  translation_tags: TranslationTags;
  authors: Authors;
  fact_box: FactBox[];
  is_fdc: boolean;
  sku_fact_box: SkuFactBox;
  medicine_interaction: MedicineInteraction;
  user_feedbacks: UserFeedbacks;
  anonymous_chats: AnonymousChats;
  disclaimer: Disclaimer;
  social_urls: SocialUrls;
  editorial_policy: EditorialPolicy;
  report_error: ReportError;
  related_ayurveda: any;
  meta_data: MetaData;
  non_translated_keys: any[];
  labs_seo_interlinking: LabsSeoInterlinking;
  fab_nudge: any;
  fab_buttons: FabButton[];
  selected_language: SelectedLanguage;
  image_without_padding: ImageWithoutPadding;
  schema: Schema;
}

export interface AvailableLanguage {
  selected: boolean;
  display_text: string;
  id: string;
  slug: string;
}

export interface Composition {
  id: number;
  name: string;
  strength: Strength;
  uses: CompositionItem;
  mechanism_of_action: CompositionItem;
  expert_advice: CompositionItem;
  how_to_take: CompositionItem;
  side_effects: CompositionItem;
  introduction: CompositionItem;
  benefits: CompositionItem;
  faqs: Faqs;
}

export interface Strength {
  display_text: string;
  unit: string;
  value: string;
}

export interface CompositionItem {
  header?: string;
  display_text: string;
  values?: CompositionValue[];
  header_placeholder_value?: string;
  type?: string;
}

export interface CompositionValue {
  name?: string;
  prefix?: string;
  display_text?: string;
  url?: string;
  description?: string;
}

export interface Faqs {
  header: string;
  data: FaqItem[];
  type: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedArticles {
  cta: Cta;
  sub_type: string;
  header: string;
  data: ArticleItem[];
}

export interface Cta {
  text: string;
  redirect_url?: string;
}

export interface ArticleItem {
  url: string;
  header: string;
  image: string;
}

export interface LastUpdatedInfo {
  display_text: string;
  cta: Cta;
}

export interface TrustBadge {
  display_text: string;
  icon: string;
}

export interface Sku {
  id: number;
  images: Image[];
  manufacturer: Manufacturer;
  name: string;
  references: References;
  slug: string;
  storage_condition: StorageCondition;
  therapeutic_class: string;
  importer: Manufacturer;
  marketer: Marketer;
  summary: Summary;
  pack_form: string;
  label: string;
  label_vsat: string;
  brief_info: BriefInfo[];
}

export interface Image {
  thumbnail: string;
  low: string;
  medium: string;
  high: string;
  mediumhigh: string;
}

export interface Manufacturer {
  id: any;
  name: any;
  address: any;
  header: any;
  manufacturer_header?: any;
  importer_header?: any;
}

export interface References {
  header: string;
  follow: boolean;
  icon_url: string;
  values: ReferenceValue[];
}

export interface ReferenceValue {
  url: string;
  data: string;
}

export interface StorageCondition {
  header: string;
  display_text: string;
}

export interface Marketer {
  id: number;
  name: string;
  address: string;
  slug: string;
  header: string;
  marketer_header: string;
}

export interface Summary {
  prescription_required: PrescriptionRequired;
  salt_composition: SaltComposition;
}

export interface PrescriptionRequired {
  header: string;
  icon: string;
  prescription_box: PrescriptionBox;
}

export interface PrescriptionBox {
  id: string;
  header: string;
  reasons: PrescriptionReason[];
  low_emphasis_upsell: LowEmphasisUpsell;
}

export interface PrescriptionReason {
  header: string;
  display_text: string;
  image_url: string;
}

export interface LowEmphasisUpsell {
  header: string;
  display_text: string;
  image_url: string;
}

export interface SaltComposition {
  header: string;
  display_text: string;
}

export interface BriefInfo {
  header: string;
  sub_header: string;
  left_icon: string;
  cta: BriefInfoCta;
}

export interface BriefInfoCta {
  action: string;
  content_description: string;
  details: BriefInfoDetails;
}

export interface BriefInfoDetails {
  target_url: any;
}

export interface FooterData {
  header: string;
  sub_header: string;
  display_text: string;
}

export interface SafetyAdvice {
  header: string;
  type: string;
  data: SafetyAdviceItem[];
}

export interface SafetyAdviceItem {
  description: string;
  display_text: string;
  icon_url: string;
  tag: SafetyTag;
}

export interface SafetyTag {
  text: string;
  bg_color: string;
}

export interface TranslationTags {
  products: string[];
  ingredients: string[];
  symptoms: string[];
}

export interface Authors {
  last_updated: LastUpdated;
  values: AuthorValue[];
  header: string;
}

export interface LastUpdated {
  header: string;
  value: string;
}

export interface AuthorValue {
  header: string;
  image_url: string;
  name: string;
  qualifications: string;
  slug: string;
  type: string;
}

export interface FactBox {
  header: string;
  values: FactBoxValue[];
  redirect_widget?: RedirectWidget;
}

export interface FactBoxValue {
  header: string;
  icon?: any;
  info_text: string;
  redirect_to?: string;
  sub_text?: any;
  text?: string;
}

export interface RedirectWidget {
  display_text: string;
  redirect_to: string;
}

export interface SkuFactBox {
  header: string;
  values: SkuFactBoxValue[];
}

export interface SkuFactBoxValue {
  header: string;
  text: string;
}

export interface MedicineInteraction {
  header: string;
  brand_substring: string;
  sub_header: string;
  values: InteractionValue[];
  view_all: ViewAll;
}

export interface InteractionValue {
  severity: string;
  route: string;
  custom_experience: string;
  action_experience: string;
  drug: Drug;
}

export interface Drug {
  id: string;
  name: string;
  slug: string;
}

export interface ViewAll {
  header: string;
  url: string;
}

export interface UserFeedbacks {
  header: string;
  survey_count: number;
  values: FeedbackValue[];
}

export interface FeedbackValue {
  header: string;
  type: string;
  values: FeedbackItem[];
  position: string;
}

export interface FeedbackItem {
  text?: string;
  value?: string;
  color?: string;
  key?: string;
  order?: number;
}

export interface AnonymousChats {
  header: string;
  values: ChatItem[];
  upfront_count: number;
  cta: Cta;
}

export interface ChatItem {
  question: string;
  answer: string;
  slug: string;
  doctor: Doctor;
}

export interface Doctor {
  image_url: string;
  name: string;
  speciality: string;
}

export interface Disclaimer {
  header: string;
  display_text: string;
}

export interface SocialUrls {
  heading: string;
  data: SocialUrlItem[];
}

export interface SocialUrlItem {
  image_url: string;
  icon_type: string;
  alternate_text: string;
  url: string;
}

export interface EditorialPolicy {
  header: string;
  image_url: string;
  slug: string;
  sub_header: string;
  cta_text: string;
}

export interface ReportError {
  header: string;
  image_url: string;
  slug: string;
  cta_text: string;
}

export interface MetaData {
  title: string;
  meta_desc: string;
  meta_keyword: string;
  heading_tag: string;
  image_alt_tag: string;
  image_title_tag: string;
  meta_tags: MetaTag[];
}

export interface MetaTag {
  name: string;
  content: string;
}

export interface LabsSeoInterlinking {
  header: string;
  link_groups: LinkGroup[];
}

export interface LinkGroup {
  group_title: string;
  links: Link[];
}

export interface Link {
  text: string;
  slug: string;
  mix_panel_data: MixPanelData;
}

export interface MixPanelData {
  text: string;
  slug: string;
  position: number;
}

export interface FabButton {
  name: string;
  action: string;
  position: number;
}

export interface SelectedLanguage {
  header: string;
  right_icon: string;
  underline_icon: string;
  cta: CtaAction;
}

export interface CtaAction {
  action: string;
}

export interface ImageWithoutPadding {
  type: string;
  version: string;
  image_data: ImageData;
}

export interface ImageData {
  url: string;
  alt: string;
  resolution: Resolution;
}

export interface Resolution {
  height: number;
  width: number;
}

export interface Schema {
  author: SchemaAuthor[];
  question: QuestionSchema;
  drug: DrugSchema;
}

export interface SchemaAuthor {
  "@type": string;
  givenName: string;
  jobTitle: string;
}

export interface QuestionSchema {
  "@context": string;
  "@type": string;
  mainEntity: QuestionItem[];
}

export interface QuestionItem {
  "@context": string;
  "@type": string;
  acceptedAnswer: AcceptedAnswer;
  name: string;
}

export interface AcceptedAnswer {
  "@type": string;
  text: string;
}

export interface DrugSchema {
  "@context": string;
  "@type": string;
  url: string;
  mainEntityOfPage: string;
  prescriptionStatus: string;
  drugUnit: string;
  activeIngredient: string;
  alcoholWarning: string;
  breastfeedingWarning: string;
  foodWarning: any;
  pregnancyWarning: string;
  marketer: SchemaMarketer;
  interactingDrug: string[];
  administrationRoute: string;
  isAvailableGenerically: boolean;
  isProprietary: boolean;
  nonProprietaryName: string;
  dosageForm: string;
  description: string;
  name: string;
  proprietaryName: string;
  availableStrength: AvailableStrength[];
  mechanismOfAction: string[];
  doseSchedule: DoseSchedule;
  image: string;
}

export interface SchemaMarketer {
  "@type": string;
  legalName: string;
}

export interface AvailableStrength {
  "@type": string;
  activeIngredient: string;
  strengthUnit: string;
  strengthValue: string;
}

export interface DoseSchedule {
  "@type": string;
  doseUnit: string;
  doseValue: string;
  frequency: string;
}

export interface StoredProductDetails {
  id: string;
  name: string;
  image: string;
  mrp: number;
  discountedPrice: number;
  discount: number;
  manufacturer?: string;
  composition?: string;
}

export interface CartBreakdown {
  totalOriginalPrice: number;
  totalDiscountedPrice: number;
  totalDiscountAmount: number;
  handlingFee: number;
  platformFee: number;
  deliveryCharge: number;
  totalPayable: number;
  appliedCoupon: string | null;
  discountAmount: number;
  timestamp: number;
}

export interface OneMGPharmacyAddToCartDetailsRequest {
  MedicineName: string;
  SKUID: string;
  SKUIdQuantity: string | number;
  EmployeeRefId: string | number;
  LoginRefId: string | number;
  PharmacyCartDetailsId:number; 
}

export interface OneMGPharmacyAddToCartDetailsResponse {
  Success: boolean;
  Message: string;
  CartId?: string;
  [key: string]: any;
}

export interface CartItem {
  OneMGSearchAllResultDetailsId: string;
  name: string;
  img?: string;
  MRP?: string;
  DiscountedPrice?: string;
  Discount?: string;
  Available?: boolean;
  quantity: number;
  price: number;
  inventoryData?: any;
  PharmacyCartDetailsId?: number;
  totalPayable?: number;
  cartId?: string; 
}

export interface EmployeeDeliveryAddress {
  EmployeeAddressDetailsId: number;
  EmployeeRefId: number;
  RelationType: number;
  Relationship: string;
  AddressType: string;
  AddressLineOne: string;
  AddressLineTwo: string;
  Landmark: string;
  StateId: number;
  StateName: string;
  CityId: number;
  DistrictName: string;
  Pincode: string;
  IsDefault: boolean;
  EmployeeDependentDetailsId: number;
  EmployeeName: string;
  MobileNo: string;
  Address: string;
}
export interface OneMGGenerateOrderResponse {
  OrderId?: string;  
  order_id?: string;  
}



//pillow
export interface PillowAPIResponse {
  status_code: string;
  status_message: string;
  datetime: string;
  version: string;
  data: {
    did_you_mean_result: any[];
    result: PillowMedicine[];
  };
}
export interface PillowMedicine {
  dosage_type: string;
  medicine_name: string;
  content: string;
  mrp: number;
  price: number;
  packing_size: string;
  pack_size: string;
  medicine_id: string;
  size: number;
  gst_percentage: number;
  medicine_type: string;
  manufacturer_name: string;
  is_rx_required: number;
  popularity_score: number;
  available_for_patient: string;
  cess_percentage: number;
  hsn_code: string;
  requested_by_entity: string;
  schedule_type: string;
  medicine_category: string;
  primary_category_id: number;
  brand_name: string;
  m_discontinued: string;
  is_approved: string;
  discontinued: string;
}


// Define interface for Pillo product
export interface PilloProduct {
  medicine_name: string;
  content: string;
  mrp: number;
  price: number;
  packing_size: string;
  pack_size: string;
  medicine_id: string;
  size: number;
  manufacturer_name: string;
  brand_name: string;
  dosage_type: string;
  is_rx_required: number;
  medicine_type: string;
  is_approved: string;
  discontinued: string;
}
// Define API response interface
export interface PilloSearchResponse {
  status_code: string;
  status_message: string;
  data: {
    result: PilloProduct[];
  };
}


export interface PilloProductDetails {
  id: string;
  medicine_name: string;
  content: string;
  how_medicine_works: string;
  how_to_use: string;
  medicine_image: string;
  is_rx_required: number;
  dosage_type: string;
  mrp: number;
  price: number;
  packing_size: string;
  pack_size: string;
  manufacturer_name: string;
  side_effects: string;
  alcohol: string;
  driving: string;
  kidney: string;
  lactation: string;
  liver: string;
  pregnancy: string;
  medicine_category: string;
  discount_percentage: number;
  in_stock: boolean;
  available_for_patient: string;
  discontinued: string;
  medicine_uses: string;
  storage_condition: string;
  interaction: string;
  fact_box: string;
  if_miss: string;
  description: string;
  medicine_images: string[];
  size_variants: Array<{
    id: string;
    size: string;
    mrp: number;
    price: number;
    packing: string;
  }>;
}