import { useState } from "react";
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

interface PlutoDetailedRFQFlowProps {
  onBack: () => void;
  onSubmit: () => void;
}

type Step = 1 | 2 | 3;

export function PlutoDetailedRFQFlow({ onBack, onSubmit }: PlutoDetailedRFQFlowProps) {
  const [step, setStep] = useState<Step>(1);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-border bg-card px-4 md:px-6">
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
      <div className="flex items-center justify-center border-b border-border bg-card py-6">
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
        <div className="mx-auto max-w-[1000px] rounded-[24px] border border-border bg-card p-6 shadow-sm md:p-8">
          {step === 1 && <Step1_BuyerDetails onNext={() => setStep(2)} />}
          {step === 2 && <Step2_ProductDetails onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <Step3_DefineTerms onBack={() => setStep(2)} onSubmit={onSubmit} />}
        </div>
      </div>
    </div>
  );
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

function Step1_BuyerDetails({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-muted-foreground">Step 1: Add Buyer Details</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Buyer Name *</Label>
          <div className="flex gap-4">
            <Input defaultValue="Samsung Private Limited" className="h-12 border-border/60 bg-background text-[15px]" />
            <Button variant="ghost" className="text-primary hover:bg-transparent hover:text-primary/90 flex items-center gap-1">
              <Plus className="size-4" /> Add New
            </Button>
          </div>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">GSTIN: 04AAACS5123K1ZL</span>
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox id="isParentQuote" />
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
              <Select defaultValue="default">
                <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">SAMSUNG INDIA ELECTRONICS PRIVATE LIMITED, Sector-77, , Haryana, Haryana, India, 140304</SelectItem>
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
          <Select defaultValue="birla">
            <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birla">Birla Pivot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Expected ETA *</Label>
          <div className="relative">
            <Input defaultValue="12" className="h-12 border-border/60 bg-background pr-16 text-[15px]" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Days</div>
          </div>
        </div>

        <div className="rounded-[16px] bg-background/40 p-5 border border-dashed border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">Open Credit Limit</div>
              <div className="text-[20px] font-medium text-green-600">₹30,56,247.73</div>
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

function Step2_ProductDetails({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
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
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Sub-Category *</Label>
            <Select defaultValue="rebar">
              <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rebar">Rebar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <RadioGroup defaultValue="primary" className="flex gap-8 py-2">
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
                  <Input placeholder="Enter Quantity" className="h-11 border-border/60 bg-background pr-14 text-sm" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                    MT <ChevronRight className="size-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onNext} className="h-12 w-full rounded-[12px] bg-muted/50 text-[15px] font-medium text-muted-foreground cursor-not-allowed">
            Next 2/3
          </Button>
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="flex gap-2">
               <Button variant="outline" className="h-10 rounded-[12px] flex items-center gap-2 text-sm">
                   Filters <Search className="size-4" />
               </Button>
               <Select>
                   <SelectTrigger className="h-10 rounded-[12px] text-sm">
                       <SelectValue placeholder="Sub Category" />
                   </SelectTrigger>
               </Select>
               <Select>
                   <SelectTrigger className="h-10 rounded-[12px] text-sm">
                       <SelectValue placeholder="Brand" />
                   </SelectTrigger>
               </Select>
           </div>

           <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               <Input placeholder="Search by Item Name" className="h-12 pl-10 rounded-[14px] border-border/60 bg-background" />
           </div>

           <div className="flex justify-end">
               <Button variant="ghost" className="text-primary hover:bg-transparent flex items-center gap-1">
                   <Plus className="size-4" /> Add New
               </Button>
           </div>

           <div className="space-y-4">
               <Label className="text-sm font-medium text-muted-foreground">Recommended Products</Label>
               <div className="divide-y divide-border/40 border-t border-border/40">
                   {[
                       { name: "Z Perlin - 200 mm x 60 mm x 2.5 mm-uat-test-2", cat: "Coils & Plates" },
                       { name: "Welspun TMT Rebar Fe550 - 25 mm - 10 Mtr Special Length", cat: "Rebar" },
                       { name: "SKS ISMB - 175 mm x 85 mm", cat: "Structural Steel" },
                       { name: "Scrap - Pig Iron", cat: "Raw Material" },
                       { name: "Primary Make CR Sheet - 1.5 mm x 1500 mm x 2500 mm", cat: "Coils & Plates" },
                       { name: "Mineral Oil", cat: "Base Oil" },
                   ].map((prod, i) => (
                       <Sheet key={i}>
                           <SheetTrigger asChild>
                               <button className="w-full py-4 flex items-center justify-between text-left group">
                                   <div>
                                       <div className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors">{prod.name}</div>
                                       <div className="text-[13px] text-muted-foreground mt-0.5">{prod.cat}</div>
                                   </div>
                                   <div className="flex size-7 items-center justify-center rounded-full border border-primary/20 text-primary group-hover:bg-primary/5">
                                       <Plus className="size-4" />
                                   </div>
                               </button>
                           </SheetTrigger>
                           <AddProductSheet product={prod.name} category={prod.cat} />
                       </Sheet>
                   ))}
               </div>
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
        <SheetContent className="w-full sm:max-w-md border-l border-border bg-card p-0">
            <SheetHeader className="p-6 border-b border-border bg-background">
                <SheetTitle className="text-lg font-medium">Add Product</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-8">
                <div className="p-4 rounded-[16px] border border-border bg-muted/20">
                    <div className="text-[15px] font-medium">{product}</div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{category}</div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">Quantity *</Label>
                    <div className="relative">
                        <Input className="h-12 border-border/60 bg-background pr-16 text-[15px]" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">MT</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[15px] font-medium">Buyer Ask Price</Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</div>
                        <Input className="h-12 border-border/60 bg-background px-11 text-[15px]" />
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

function Step3_DefineTerms({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-lg font-medium text-muted-foreground">Step 3: Define Terms</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Deal Amount *</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</div>
            <Input defaultValue="12,222" className="h-12 border-border/60 bg-background px-11 text-[18px] font-medium" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Payment Terms *</Label>
          <Select defaultValue="advance">
            <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Enhancer Types</Label>
          <Select defaultValue="none">
            <SelectTrigger className="h-12 border-border/60 bg-background text-[15px]">
              <SelectValue placeholder="--Select--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">--Select--</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">IDD</Label>
            <div className="relative">
              <Input placeholder="0" className="h-12 border-border/60 bg-background pr-16 text-[15px]" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">days</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">MDD</Label>
            <div className="relative">
              <Input placeholder="0" className="h-12 border-border/60 bg-background pr-16 text-[15px]" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">days</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Assign Category Manager *</Label>
          <div className="mt-4 flex items-center justify-between p-4 rounded-[16px] bg-muted/10 border border-border/40">
             <div className="flex items-center gap-3">
                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Check className="size-5" />
                 </div>
                 <div className="text-[15px] font-medium">sohan satish</div>
             </div>
             <button className="text-primary text-sm font-medium hover:underline">Re-Assign</button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-[12px] text-base font-medium">
          Save & Exit
        </Button>
        <Button onClick={onSubmit} className="h-12 flex-1 rounded-[12px] bg-sky-950 text-white hover:bg-sky-900 text-base font-medium shadow-xl shadow-sky-900/10">
          Submit
        </Button>
      </div>
    </div>
  );
}
