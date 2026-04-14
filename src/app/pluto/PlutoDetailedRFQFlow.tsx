import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import { cn } from "@/app/components/ui/utils";
import { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";
import { MOCK_BUYERS, getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { getBuyerPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";
import { getSupportedCategories } from "@/domain/cm/cm.assignment";
import { getBuyerDefaultsForEnquiry } from "@/domain/enquiry/enquiry.schema";
import { PERSONAS, getPersonasByRole } from "@/domain/persona/persona.data";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";

export interface DetailedRFQFormData {
  buyerId: string;
  isParentQuote: boolean;
  deliveryLocation: string;
  scopeOfUnloading: string;
  etaDays: string;
  category: string;
  enhancerType: string;
  dealAmount: string;
  paymentTerms: string;
  iddDays: string;
  mddDays: string;
  notes: string;
  categoryManagerId: string;
}

const INITIAL_FORM_DATA: DetailedRFQFormData = {
  buyerId: "buyer_1",
  isParentQuote: false,
  deliveryLocation: "SAMSUNG INDIA ELECTRONICS PRIVATE LIMITED, Sector-77, Haryana, India, 140304",
  scopeOfUnloading: "Birla Pivot",
  etaDays: "12",
  category: "Steel",
  enhancerType: "primary",
  dealAmount: "12,222",
  paymentTerms: "advance",
  iddDays: "10",
  mddDays: "15",
  notes: "",
  categoryManagerId: "p_cm_north",
};

interface PlutoDetailedRFQFlowProps {
  onBack: () => void;
  onSubmit: (intake: EnquiryIntake) => void;
  prefillRecord?: EnquiryRecord;
}

type Step = 1 | 2 | 3;

export function PlutoDetailedRFQFlow({ onBack, onSubmit, prefillRecord }: PlutoDetailedRFQFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const initialFormData = useMemo(
    () => buildInitialFormData(prefillRecord),
    [prefillRecord],
  );
  const [formData, setFormData] = useState<DetailedRFQFormData>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
    setStep(1);
  }, [initialFormData]);

  const updateField = (field: keyof DetailedRFQFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuyerChange = (buyerId: string) => {
    const defaults = getBuyerDefaultsForEnquiry(buyerId, "DetailedRFQ");
    setFormData(prev => ({
       ...prev,
       buyerId,
       deliveryLocation: defaults.deliveryLocation || "",
       etaDays: defaults.etaDays || "12",
       paymentTerms: defaults.paymentTerms || "advance",
    }));
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-border/55 bg-card px-4 md:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-xl font-medium tracking-tight">Create Enquiry</h1>
      </header>

      {/* Stepper */}
      <div className="flex items-center justify-center border-b border-border/55 bg-card py-6">
        <div className="flex items-center gap-2">
          <StepIndicator number={1} label="Enquiry" active={step >= 1} completed={step > 1} />
          <div className={cn("h-px w-16 bg-border", step > 1 && "bg-primary")} />
          <StepIndicator number={2} label="Response" active={step >= 2} completed={step > 2} />
          <div className={cn("h-px w-16 bg-border", step > 2 && "bg-primary")} />
          <StepIndicator number={3} label="Confirm" active={step >= 3} completed={step > 3} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background/50 p-4 md:p-8">
        <div className="mx-auto max-w-[1000px] rounded-[24px] border border-border/55 bg-card p-6 shadow-sm md:p-8">
          {step === 1 && (
            <Step1_BuyerDetails 
              data={formData} 
              updateField={updateField} 
              onBuyerChange={handleBuyerChange}
              onNext={() => setStep(2)} 
            />
          )}
          {step === 2 && (
            <Step2_ProductDetails 
              data={formData} 
              updateField={updateField} 
              onBack={() => setStep(1)} 
              onNext={() => setStep(3)} 
            />
          )}
          {step === 3 && (
            <Step3_DefineTerms 
              data={formData} 
              updateField={updateField} 
              onBack={() => setStep(2)} 
              onSubmit={() => {
                const selectedBuyer = getBuyerById(formData.buyerId);
                const buyerPersonaId = formData.buyerId ? getBuyerPersonaFromBuyerId(formData.buyerId) : undefined;

                const intake: EnquiryIntake = {
                  buyer: {
                    personaId: buyerPersonaId,
                    buyerId: formData.buyerId,
                    manualName: selectedBuyer?.name || "",
                  },
                  requirements: {
                    categories: formData.category ? [formData.category as any] : [],
                    estimatedValue: parseFloat(formData.dealAmount.replace(/,/g, "")),
                    paymentTerms: formData.paymentTerms,
                    etaDays: parseInt(formData.etaDays, 10),
                    notes: formData.notes,
                    isParentQuote: formData.isParentQuote,
                    deliveryLocation: formData.deliveryLocation,
                    scopeOfUnloading: formData.scopeOfUnloading,
                    enhancerTypes: formData.enhancerType ? [formData.enhancerType] : [],
                    iddDays: parseInt(formData.iddDays, 10),
                    mddDays: parseInt(formData.mddDays, 10),
                    primaryCMId: formData.categoryManagerId,
                  },
                  source: {
                    medium: "internal",
                    rfqMode: "detailed",
                  },
                };
                onSubmit(intake);
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function buildInitialFormData(prefillRecord?: EnquiryRecord): DetailedRFQFormData {
  if (!prefillRecord) {
    return INITIAL_FORM_DATA;
  }

  const buyerId =
    prefillRecord.buyer.id && MOCK_BUYERS.some((buyer) => buyer.id === prefillRecord.buyer.id)
      ? prefillRecord.buyer.id
      : INITIAL_FORM_DATA.buyerId;
  const category = prefillRecord.requirements.categories[0] || INITIAL_FORM_DATA.category;
  const enhancerType = prefillRecord.requirements.enhancerTypes?.[0] || INITIAL_FORM_DATA.enhancerType;
  const dealAmount =
    typeof prefillRecord.requirements.estimatedValue === "number" &&
    Number.isFinite(prefillRecord.requirements.estimatedValue)
      ? prefillRecord.requirements.estimatedValue.toLocaleString("en-IN")
      : INITIAL_FORM_DATA.dealAmount;
  const scopeOfUnloading = [
    "Birla Pivot",
    "Buyer Scope",
    "Seller Scope",
  ].includes(prefillRecord.requirements.scopeOfUnloading || "")
    ? (prefillRecord.requirements.scopeOfUnloading as string)
    : INITIAL_FORM_DATA.scopeOfUnloading;
  const paymentTerms = ["advance", "credit"].includes(prefillRecord.requirements.paymentTerms || "")
    ? (prefillRecord.requirements.paymentTerms as string)
    : INITIAL_FORM_DATA.paymentTerms;
  const categoryManagerId =
    prefillRecord.assignment.primaryCMId &&
    getPersonasByRole("CM").some((cm) => cm.id === prefillRecord.assignment.primaryCMId)
      ? prefillRecord.assignment.primaryCMId
      : INITIAL_FORM_DATA.categoryManagerId;

  return {
    ...INITIAL_FORM_DATA,
    buyerId,
    isParentQuote: prefillRecord.requirements.isParentQuote ?? INITIAL_FORM_DATA.isParentQuote,
    deliveryLocation:
      prefillRecord.requirements.deliveryLocation || INITIAL_FORM_DATA.deliveryLocation,
    scopeOfUnloading,
    etaDays:
      prefillRecord.requirements.etaDays != null
        ? String(prefillRecord.requirements.etaDays)
        : INITIAL_FORM_DATA.etaDays,
    category,
    enhancerType,
    dealAmount,
    paymentTerms,
    iddDays:
      prefillRecord.requirements.iddDays != null
        ? String(prefillRecord.requirements.iddDays)
        : INITIAL_FORM_DATA.iddDays,
    mddDays:
      prefillRecord.requirements.mddDays != null
        ? String(prefillRecord.requirements.mddDays)
        : INITIAL_FORM_DATA.mddDays,
    notes: prefillRecord.requirements.notes || INITIAL_FORM_DATA.notes,
    categoryManagerId,
  };
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
          completed
            ? "bg-primary text-primary-foreground"
            : active
            ? "border-2 border-primary text-primary"
            : "border-2 border-muted-foreground/30 text-muted-foreground/50",
        )}
      >
        {completed ? <Check className="size-3.5" /> : number}
      </div>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground/50",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Step1_BuyerDetails({ 
  data, 
  updateField, 
  onBuyerChange,
  onNext 
}: { 
  data: DetailedRFQFormData; 
  updateField: (field: keyof DetailedRFQFormData, value: any) => void;
  onBuyerChange: (buyerId: string) => void;
  onNext: () => void; 
}) {
  const buyerDefaults = getBuyerDefaultsForEnquiry(data.buyerId, "DetailedRFQ");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-muted-foreground">Step 1: Add Buyer Details</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Buyer Name *</Label>
          <div className="flex gap-4">
            <Select 
              value={data.buyerId} 
              onValueChange={onBuyerChange}
            >
              <SelectTrigger className="h-12 border-border/60 bg-background text-[15px] flex-1">
                <SelectValue placeholder="Select an existing buyer" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_BUYERS.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" className="text-primary hover:bg-transparent hover:text-primary/90 flex items-center gap-1">
              <Plus className="size-4" /> Add New
            </Button>
          </div>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">GSTIN: {buyerDefaults.gstin}</span>
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox 
            id="isParentQuote" 
            checked={data.isParentQuote}
            onCheckedChange={(checked) => updateField("isParentQuote", !!checked)}
          />
          <Label htmlFor="isParentQuote" className="text-[15px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Is Parent Quote?
          </Label>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[15px] font-medium">Delivery Location</Label>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ship To *</Label>
            <div className="flex gap-4">
              <Select 
                value={data.deliveryLocation || "default"} 
                onValueChange={(val) => updateField("deliveryLocation", val)}
              >
                <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {buyerDefaults.deliveryLocations?.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                  {(!buyerDefaults.deliveryLocations || buyerDefaults.deliveryLocations.length === 0) && (
                      <SelectItem value="default">{INITIAL_FORM_DATA.deliveryLocation}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button variant="ghost" className="text-primary hover:bg-transparent hover:text-primary/90 flex items-center gap-1">
                <Plus className="size-4" /> Add New
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[15px] font-medium">Scope of Unloading</Label>
          <Select value={data.scopeOfUnloading} onValueChange={(val) => updateField("scopeOfUnloading", val)}>
            <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Birla Pivot">Birla Pivot</SelectItem>
              <SelectItem value="Buyer Scope">Buyer Scope</SelectItem>
              <SelectItem value="Seller Scope">Seller Scope</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="etaDays" className="text-xs uppercase tracking-wider text-muted-foreground">Expected ETA *</Label>
          <div className="relative">
            <Input 
              id="etaDays"
              name="etaDays"
              value={data.etaDays} 
              onChange={(e) => updateField("etaDays", e.target.value)}
              className="h-12 border-border/60 bg-background pr-16 text-[15px]" 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Days</div>
          </div>
        </div>

        <div className="rounded-[16px] bg-background/40 p-5 border border-dashed border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">Open Credit Limit</div>
              <div className="text-[20px] font-medium text-green-600">
                  {buyerDefaults.openCreditLimit ? `₹${buyerDefaults.openCreditLimit.toLocaleString('en-IN')}` : "₹0"}
              </div>
            </div>
            <button className="text-sm font-medium text-primary underline">View</button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" className="h-12 flex-1 rounded-[12px] text-base font-medium">
          Save & Exit
        </Button>
        <Button onClick={onNext} className="h-12 flex-1 rounded-[12px] bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90">
          Next Step
        </Button>
      </div>
    </div>
  );
}

function Step2_ProductDetails({ 
  data, 
  updateField, 
  onBack, 
  onNext 
}: { 
  data: DetailedRFQFormData;
  updateField: (field: keyof DetailedRFQFormData, value: any) => void;
  onBack: () => void; 
  onNext: () => void; 
}) {
  const [activeTab, setActiveTab] = useState("steel");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-muted-foreground">Step 2: Add Product Details</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/30">
          <TabsTrigger value="steel" className="rounded-[10px] text-[15px]">Steel & Allied</TabsTrigger>
          <TabsTrigger value="all" className="rounded-[10px] text-[15px]">All Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="steel" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Category *</Label>
            <Select 
              value={data.category}
              onValueChange={(val) => updateField("category", val)}
            >
              <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {getSupportedCategories().map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <RadioGroup value={data.enhancerType} onValueChange={(val) => updateField("enhancerType", val)} className="flex gap-8 py-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="primary" id="primary" />
              <Label htmlFor="primary" className="text-[15px]">Primary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="secondary" id="secondary" />
              <Label htmlFor="secondary" className="text-[15px]">Secondary</Label>
            </div>
          </RadioGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Brand *</Label>
              <Select>
                <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
                  <SelectValue placeholder="-Select-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tata">TATA</SelectItem>
                  <SelectItem value="jsw">JSW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Preferred Grade *</Label>
              <Select>
                <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
                  <SelectValue placeholder="-Select-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fe500">Fe 500</SelectItem>
                  <SelectItem value="fe550">Fe 550</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <Label className="text-sm font-medium text-muted-foreground">Diameter</Label>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">Quantity *</Label>
            </div>
            
            {[8, 10, 12, 16, 20, 25, 32, 36, 40].map((dim) => (
              <div key={dim} className="grid grid-cols-2 gap-4 items-center">
                <div className="h-11 flex items-center px-4 bg-muted/20 border border-border/40 rounded-[12px] text-sm font-medium">
                  {dim}
                </div>
                <div className="relative">
                  <Input id={`qty-${dim}`} name={`qty-${dim}`} aria-label={`Quantity for ${dim} MT`} placeholder="Enter Quantity" className="h-11 border-border/60 bg-background pr-14 text-sm" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                    MT <ChevronRight className="size-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => {
              // For simulation, we just allow next
              onNext();
            }} 
            className="h-12 w-full rounded-[12px] bg-primary text-[15px] font-medium text-primary-foreground"
          >
            Next 2/3
          </Button>
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           {/* Summary view for "All" */}
           <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg">
             <span className="text-sm font-medium text-muted-foreground">Product Category</span>
             <span className="text-sm font-bold">{data.category || "None"}</span>
           </div>
           
           <Button onClick={onNext} className="h-12 w-full rounded-[12px] bg-primary text-[15px] font-medium text-primary-foreground shadow-lg shadow-primary/20">
             Next Step
           </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddProductSheet({ product, category }: { product: string; category: string }) {
    return (
        <SheetContent className="w-full sm:max-w-md border-l border-border/55 bg-card p-0">
            <SheetHeader className="p-6 border-b border-border/55 bg-background">
                <SheetTitle className="text-lg font-medium">Add Product</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-8">
                <div className="p-4 rounded-[16px] border border-border/55 bg-muted/20">
                    <div className="text-[15px] font-medium">{product}</div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{category}</div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="productQty" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">Quantity *</Label>
                    <div className="relative">
                        <Input id="productQty" name="productQty" className="h-12 border-border/60 bg-background pr-16 text-[15px]" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">MT</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label htmlFor="buyerAskPrice" className="text-[15px] font-medium">Buyer Ask Price</Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</div>
                        <Input id="buyerAskPrice" name="buyerAskPrice" className="h-12 border-border/60 bg-background px-11 text-[15px]" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Per MT</div>
                    </div>
                </div>

                <Button className="w-full h-12 rounded-[12px] bg-sky-950 text-white hover:bg-sky-900 mt-6">
                    Add Product
                </Button>
            </div>
        </SheetContent>
    );
}

function Step3_DefineTerms({ 
  data, 
  updateField, 
  onBack, 
  onSubmit 
}: { 
  data: DetailedRFQFormData;
  updateField: (field: keyof DetailedRFQFormData, value: any) => void;
  onBack: () => void; 
  onSubmit: () => void; 
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-lg font-medium text-muted-foreground">Step 3: Define Terms</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="dealAmount" className="text-xs uppercase tracking-wider text-muted-foreground">Deal Amount *</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</div>
            <Input 
              id="dealAmount"
              name="dealAmount"
              value={data.dealAmount} 
              onChange={(e) => updateField("dealAmount", e.target.value)}
              className="h-12 border-border/60 bg-background px-11 text-[18px] font-medium" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Payment Terms *</Label>
          <Select 
            value={data.paymentTerms} 
            onValueChange={(val) => updateField("paymentTerms", val)}
          >
            <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="iddDays" className="text-xs uppercase tracking-wider text-muted-foreground">IDD *</Label>
            <div className="relative">
              <Input
                id="iddDays"
                name="iddDays"
                value={data.iddDays}
                onChange={(e) => updateField("iddDays", e.target.value)}
                className="h-12 border-border/60 bg-background pr-16 text-[15px]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Days</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mddDays" className="text-xs uppercase tracking-wider text-muted-foreground">MDD *</Label>
            <div className="relative">
              <Input
                id="mddDays"
                name="mddDays"
                value={data.mddDays}
                onChange={(e) => updateField("mddDays", e.target.value)}
                className="h-12 border-border/60 bg-background pr-16 text-[15px]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Days</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Additional Notes</Label>
          <Input 
            id="notes"
            name="notes"
            value={data.notes} 
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any specific requirements..."
            className="h-12 border-border/60 bg-background text-[15px]" 
          />
        </div>

        <div className="pt-4 border-t border-border/55">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Assign Category Manager *</Label>
          <div className="mt-4">
            <Select 
              value={data.categoryManagerId} 
              onValueChange={(val) => updateField("categoryManagerId", val)}
            >
              <SelectTrigger className="h-14 border-border/60 bg-muted/10 text-[15px] rounded-[16px] px-4 font-medium">
                <SelectValue placeholder="Select Category Manager" />
              </SelectTrigger>
              <SelectContent>
                {getPersonasByRole("CM").map((cm) => (
                  <SelectItem key={cm.id} value={cm.id}>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                        {cm.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{cm.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-[12px] text-base font-medium">
          Back
        </Button>
        <Button onClick={onSubmit} className="h-12 flex-1 rounded-[12px] bg-sky-950 text-white hover:bg-sky-900 text-base font-medium shadow-xl shadow-sky-900/10">
          Submit RFQ
        </Button>
      </div>
    </div>
  );
}
