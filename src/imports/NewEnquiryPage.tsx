import svgPaths from "./svg-djrcb0w3bq";

function FooterNavigationIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Footer Navigation Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Footer Navigation Icon">
          <path d={svgPaths.p37e8800} id="Vector" stroke="var(--stroke-0, #DFE2E5)" strokeLinecap="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function FooterNavigation() {
  return (
    <div className="bg-[rgba(70,76,83,0.4)] content-stretch flex items-center p-[4px] relative rounded-[4px] shrink-0" data-name="Footer Navigation">
      <FooterNavigationIcon />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[44.65%_0.63%_0.23%_0.63%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80.4969 17.6358">
        <g id="Group">
          <path d={svgPaths.p25645700} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p38085d00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p6d6a2f1} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p1030d780} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p3b71cd80} fill="var(--fill-0, #4E5AF3)" id="Vector_5" />
          <path d={svgPaths.p246ce80} fill="url(#paint0_linear_2142_8128)" id="Vector_6" />
          <path d={svgPaths.p246ce80} fill="url(#paint1_radial_2142_8128)" fillOpacity="0.8" id="Vector_7" />
          <path d={svgPaths.p246ce80} fill="url(#paint2_radial_2142_8128)" fillOpacity="0.5" id="Vector_8" />
          <path d={svgPaths.p3b4cf480} fill="url(#paint3_linear_2142_8128)" id="Vector_9" />
          <path d={svgPaths.p3b71cd80} fill="url(#paint4_radial_2142_8128)" id="Vector_10" opacity="0.65" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2142_8128" x1="26.9882" x2="34.0383" y1="1.30758" y2="15.3718">
            <stop stopColor="#CA46A3" />
            <stop offset="0.6295" stopColor="#A3AFBF" />
            <stop offset="1" stopColor="#8DE9CE" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="matrix(5.32888 -2.98293 2.6939 4.76388 28.4544 7.15262)" gradientUnits="userSpaceOnUse" id="paint1_radial_2142_8128" r="1">
            <stop stopColor="#3041D9" />
            <stop offset="1" stopColor="#3041D9" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="matrix(-3.91347 2.5663 -1.92657 -2.90819 34.4976 3.40847)" gradientUnits="userSpaceOnUse" id="paint2_radial_2142_8128" r="1">
            <stop stopColor="#3041D9" />
            <stop offset="1" stopColor="#3041D9" stopOpacity="0" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_2142_8128" x1="35.6554" x2="36.2244" y1="-0.381957" y2="3.50012">
            <stop stopColor="#3041D9" />
            <stop offset="0.473658" stopColor="#66A3D3" />
            <stop offset="1" stopColor="#8DE9CE" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="matrix(8.16208 5.44439 -5.02358 7.481 34.4961 3.62498)" gradientUnits="userSpaceOnUse" id="paint4_radial_2142_8128" r="1">
            <stop offset="0.15625" stopColor="#FF74C4" />
            <stop offset="0.640625" stopColor="#BD68FF" />
            <stop offset="1" stopColor="#3041D9" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[1.05%_52.15%_70.03%_0.63%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38.4895 9.25418">
        <g id="Group">
          <path d={svgPaths.p222d1c00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p12445980} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p42ab100} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p2ad8fd80} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p3fc1a200} fill="var(--fill-0, white)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="h-[32px] overflow-clip relative shrink-0 w-[81.524px]" data-name="Logo">
      <Group />
      <Group1 />
    </div>
  );
}

function FooterContent() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Footer Content">
      <FooterNavigation />
      <Logo />
    </div>
  );
}

function FooterUserInfo() {
  return (
    <div className="bg-[#fa0] content-stretch flex flex-col items-center justify-center px-[7px] py-[10px] relative rounded-[16px] shrink-0 size-[32px]" data-name="Footer User Info">
      <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#042b4c] text-[12px] uppercase whitespace-nowrap">
        <p className="leading-[18px]">DV</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-[#25282d] content-stretch flex items-start justify-between left-0 overflow-clip px-[24px] py-[16px] top-0 w-[1440px]" data-name="Footer">
      <FooterContent />
      <FooterUserInfo />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="search">
          <path d={svgPaths.p10517e00} fill="var(--stroke-0, #4039AD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function PencilEdit() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="pencil-edit-02">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="pencil-edit-02">
          <path d={svgPaths.pa2bdc00} fill="var(--stroke-0, #25282D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ArrowDown01Round() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-down-01-round">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-down-01-round">
          <path d={svgPaths.p61cfe00} id="Vector" stroke="var(--stroke-0, #25282D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <PencilEdit />
      <ArrowDown01Round />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div aria-hidden="true" className="absolute border-[#dfe2e5] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[16px] pr-[12px] py-[20px] relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#25282d] text-[20px]">
            <p className="leading-[32px] whitespace-pre-wrap">Enquiries</p>
          </div>
          <Search />
          <Frame25 />
        </div>
      </div>
    </div>
  );
}

function TabButtonBase() {
  return (
    <div className="h-[32px] relative rounded-[8px] shrink-0" data-name="_Tab button base">
      <div className="content-stretch flex gap-[4px] h-full items-center justify-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#33373d] text-[14px] text-center">Unread</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#b5bbc3] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TabButtonBase1() {
  return (
    <div className="h-[32px] relative rounded-[8px] shrink-0" data-name="_Tab button base">
      <div className="content-stretch flex gap-[4px] h-full items-center justify-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#33373d] text-[14px] text-center">Groups</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#b5bbc3] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TabButtonBase2() {
  return (
    <div className="h-[32px] relative rounded-[8px] shrink-0" data-name="_Tab button base">
      <div className="content-stretch flex gap-[4px] h-full items-center justify-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#33373d] text-[14px] text-center">Mentions</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#b5bbc3] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function HorizontalTabs() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center relative shrink-0 w-full" data-name="Horizontal tabs">
      <TabButtonBase />
      <TabButtonBase1 />
      <TabButtonBase2 />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pb-[8px] pl-[16px] pr-[12px] pt-[16px] relative w-full">
        <HorizontalTabs />
      </div>
    </div>
  );
}

function ArrowDown01Round1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-down-01-round">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-down-01-round">
          <path d={svgPaths.p61cfe00} id="Vector" stroke="var(--stroke-0, #25282D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <p className="font-['Inter:Light',sans-serif] font-light leading-[24px] not-italic relative shrink-0 text-[#575f68] text-[16px]">6</p>
      <ArrowDown01Round1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[16px] pr-[12px] py-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-h-px min-w-px not-italic relative text-[#25282d] text-[16px] whitespace-pre-wrap">Enquiry Threads</p>
          <Frame4 />
        </div>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[20px] min-h-px min-w-px not-italic relative">
      <p className="font-['Inter:Light',sans-serif] font-light relative shrink-0 text-[#25282d] text-[12px]">#AX921BW74HE</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full overflow-hidden relative shrink-0 text-[#33373d] text-[14px] text-ellipsis w-[min-content] whitespace-nowrap">Vandelay Industries</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#25282d] text-[14px]">₹75,000</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#fff0e6] relative rounded-[4px] shrink-0" data-name="Badge">
      <div className="content-stretch flex items-center overflow-clip px-[8px] py-[2px] relative rounded-[inherit]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#ba4e00] text-[12px] text-center">Sourcing Required</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#cc6923] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[16px] relative w-full">
          <Frame26 />
          <Badge />
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="h-[2px] relative shrink-0 w-full" data-name="Separator">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342 2">
        <g id="Separator">
          <path d="M0 0.5H342" id="Vector 130" stroke="var(--stroke-0, #0E1E2E)" strokeOpacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[20px] min-h-px min-w-px not-italic relative">
      <p className="font-['Inter:Light',sans-serif] font-light relative shrink-0 text-[#25282d] text-[12px]">#YU782IO41QA</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full overflow-hidden relative shrink-0 text-[#33373d] text-[14px] text-ellipsis w-[min-content] whitespace-nowrap">Acme Corp</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#25282d] text-[14px]">₹120,000</p>
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-[#eef4fd] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[4px] shrink-0" data-name="Badge">
      <div aria-hidden="true" className="absolute border-[#0a58c6] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#08479e] text-[12px] text-center">Draft</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[16px] relative w-full">
          <Frame27 />
          <Badge1 />
        </div>
      </div>
    </div>
  );
}

function Separator1() {
  return (
    <div className="h-[2px] relative shrink-0 w-full" data-name="Separator">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342 2">
        <g id="Separator">
          <path d="M0 0.5H342" id="Vector 130" stroke="var(--stroke-0, #0E1E2E)" strokeOpacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[20px] min-h-px min-w-px not-italic relative">
      <p className="font-['Inter:Light',sans-serif] font-light relative shrink-0 text-[#25282d] text-[12px]">#ZX190VC63LP</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full overflow-hidden relative shrink-0 text-[#4039ad] text-[14px] text-ellipsis w-[min-content] whitespace-nowrap">Initech Systems</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#25282d] text-[14px]">₹62,500</p>
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-[rgba(242,241,252,0.6)] relative rounded-[4px] shrink-0" data-name="Badge">
      <div className="content-stretch flex items-center overflow-clip px-[8px] py-[2px] relative rounded-[inherit]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#4039ad] text-[12px] text-center">Awaiting Response</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#8e88e7] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[rgba(242,241,252,0.6)] relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[16px] relative w-full">
          <Frame28 />
          <Badge2 />
        </div>
      </div>
    </div>
  );
}

function Separator2() {
  return (
    <div className="h-[2px] relative shrink-0 w-full" data-name="Separator">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342 2">
        <g id="Separator">
          <path d="M0 0.5H342" id="Vector 130" stroke="var(--stroke-0, #0E1E2E)" strokeOpacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[20px] min-h-px min-w-px not-italic relative">
      <p className="font-['Inter:Light',sans-serif] font-light relative shrink-0 text-[#25282d] text-[12px]">#QW567ER90UI</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full overflow-hidden relative shrink-0 text-[#33373d] text-[14px] text-ellipsis w-[min-content] whitespace-nowrap">Globex Corporation</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#25282d] text-[14px]">₹98,000</p>
    </div>
  );
}

function Badge3() {
  return (
    <div className="bg-[#fff0e6] relative rounded-[4px] shrink-0" data-name="Badge">
      <div className="content-stretch flex items-center overflow-clip px-[8px] py-[2px] relative rounded-[inherit]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#ba4e00] text-[12px] text-center">Sourcing Required</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#cc6923] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[16px] relative w-full">
          <Frame29 />
          <Badge3 />
        </div>
      </div>
    </div>
  );
}

function Separator3() {
  return (
    <div className="h-[2px] relative shrink-0 w-full" data-name="Separator">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342 2">
        <g id="Separator">
          <path d="M0 0.5H342" id="Vector 130" stroke="var(--stroke-0, #0E1E2E)" strokeOpacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[20px] min-h-px min-w-px not-italic relative">
      <p className="font-['Inter:Light',sans-serif] font-light relative shrink-0 text-[#25282d] text-[12px]">#AS345DF28GH</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full overflow-hidden relative shrink-0 text-[#33373d] text-[14px] text-ellipsis w-[min-content] whitespace-nowrap">Global Solutions Ltd</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#25282d] text-[14px]">₹40,000</p>
    </div>
  );
}

function Badge4() {
  return (
    <div className="bg-[#e5f7df] relative rounded-[4px] shrink-0" data-name="Badge">
      <div className="content-stretch flex items-center overflow-clip px-[8px] py-[2px] relative rounded-[inherit]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2c541e] text-[12px] text-center">Converted to Order</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#57a53a] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Frame9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[16px] relative w-full">
          <Frame30 />
          <Badge4 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[514px] relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Frame3 />
        <Frame5 />
        <Separator />
        <Frame6 />
        <Separator1 />
        <Frame7 />
        <Separator2 />
        <Frame8 />
        <Separator3 />
        <Frame9 />
      </div>
      <div aria-hidden="true" className="absolute border-[#dfe2e5] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function ArrowDown01Round2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-down-01-round">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-down-01-round">
          <path d={svgPaths.p61cfe00} id="Vector" stroke="var(--stroke-0, #25282D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <p className="font-['Inter:Light',sans-serif] font-light leading-[24px] not-italic relative shrink-0 text-[#575f68] text-[16px]">10</p>
      <ArrowDown01Round2 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pb-[12px] pl-[16px] pr-[12px] pt-[16px] relative w-full">
          <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-h-px min-w-px not-italic relative text-[#25282d] text-[16px] whitespace-pre-wrap">Groups</p>
          <Frame12 />
        </div>
      </div>
    </div>
  );
}

function Message4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="message-01">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="message-01">
          <path d={svgPaths.p3ed7eb00} fill="var(--stroke-0, #25282D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame13() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[12px] relative w-full">
          <Message4 />
          <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#25282d] text-[14px] whitespace-pre-wrap">{`Sai Industries <> Birla Pivot`}</p>
        </div>
      </div>
    </div>
  );
}

function Message() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="message-01">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="message-01">
          <path d={svgPaths.p3ed7eb00} fill="var(--stroke-0, #4039AD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-[rgba(242,241,252,0.6)] relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[12px] relative w-full">
          <Message />
          <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#4039ad] text-[14px] whitespace-pre-wrap">{`Goyal Enterprises <> Birla Pivot`}</p>
        </div>
      </div>
    </div>
  );
}

function Message1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="message-01">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="message-01">
          <path d={svgPaths.p3ed7eb00} fill="var(--stroke-0, #25282D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[12px] relative w-full">
          <Message1 />
          <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#25282d] text-[14px] whitespace-pre-wrap">{`Karan Motors <> Birla Pivot`}</p>
        </div>
      </div>
    </div>
  );
}

function Message2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="message-01">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="message-01">
          <path d={svgPaths.p3ed7eb00} fill="var(--stroke-0, #25282D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame16() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[12px] relative w-full">
          <Message2 />
          <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#25282d] text-[14px] whitespace-pre-wrap">{`Reddy Associates <> Birla Pivot`}</p>
        </div>
      </div>
    </div>
  );
}

function Message3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="message-01">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="message-01">
          <path d={svgPaths.p3ed7eb00} fill="var(--stroke-0, #25282D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame17() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pl-[24px] pr-[12px] py-[12px] relative w-full">
          <Message3 />
          <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#25282d] text-[14px] whitespace-pre-wrap">{`Verma Corp <> Birla Pivot`}</p>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col h-[340px] items-start relative shrink-0 w-full" data-name="Frame">
      <div aria-hidden="true" className="absolute border-[#dfe2e5] border-b border-solid inset-0 pointer-events-none" />
      <Frame11 />
      <Frame13 />
      <Frame14 />
      <Frame15 />
      <Frame16 />
      <Frame17 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative" data-name="Frame">
      <Frame1 />
      <Container1 />
      <Frame2 />
      <Frame10 />
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white relative self-stretch shrink-0 w-[342px] z-[2]" data-name="Container">
      <div className="content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">
        <Frame />
      </div>
      <div aria-hidden="true" className="absolute border-[#dfe2e5] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Download() {
  return <div className="absolute left-[10px] overflow-clip size-[20px] top-[10px]" data-name="download 1" />;
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Icon">
      <div className="absolute left-0 size-[40px] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
          <circle cx="20" cy="20" fill="var(--fill-0, #7A76EC)" id="Ellipse 3711" r="20" />
        </svg>
      </div>
      <Download />
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px not-italic relative text-[#25282d]">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full overflow-hidden relative shrink-0 text-[18px] text-ellipsis w-[min-content] whitespace-nowrap">
        <p className="leading-[28px] overflow-hidden">Initech Systems</p>
      </div>
      <p className="font-['Inter:Light',sans-serif] font-light leading-[20px] relative shrink-0 text-[12px]">#ZX190VC63LP</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[#2b7fff] content-stretch flex items-center justify-center left-0 p-[1.875px] rounded-[20971500px] size-[23.994px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.875px] border-solid border-white inset-0 pointer-events-none rounded-[20971500px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white">AK</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#ad46ff] content-stretch flex items-center justify-center left-[16px] p-[1.875px] rounded-[20971500px] size-[23.994px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.875px] border-solid border-white inset-0 pointer-events-none rounded-[20971500px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white">MI</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[#00c950] content-stretch flex items-center justify-center left-[31.99px] p-[1.875px] rounded-[20971500px] size-[23.994px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.875px] border-solid border-white inset-0 pointer-events-none rounded-[20971500px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white">SR</p>
    </div>
  );
}

function Gv() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[55.986px]" data-name="Gv">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container3 />
        <Container4 />
        <Container5 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[4px] not-italic text-[#364153] text-[14px] text-center top-[0.25px] tracking-[-0.1504px]">3</p>
      </div>
    </div>
  );
}

function Gv1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[8.828px]" data-name="Gv">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Text />
      </div>
    </div>
  );
}

function Container6() {
  return <div className="bg-[#d1d5dc] h-[15.996px] shrink-0 w-[0.996px]" data-name="Container" />;
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d="M3.33252 7.99805H12.6636" id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 3.33252V12.6636" id="Vector_2" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Gv2() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[24.98px]" data-name="Gv">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.994px] items-center pl-[3.994px] relative size-full">
        <Container6 />
        <Icon1 />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white content-stretch flex gap-[7.998px] h-[40px] items-center justify-center p-[0.625px] relative rounded-[8px] shrink-0 w-[131px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Gv />
      <Gv1 />
      <Gv2 />
    </div>
  );
}

function Audit() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="audit-02">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="audit-02">
          <path d={svgPaths.p28ec6180} fill="var(--stroke-0, #25282D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonsButton() {
  return (
    <div className="content-stretch flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Buttons/Button">
      <div aria-hidden="true" className="absolute border-[#dfe2e5] border-[0.5px] border-solid inset-[-0.25px] pointer-events-none rounded-[8.25px] shadow-[0px_4px_8px_0px_rgba(10,13,18,0.12)]" />
      <Audit />
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
      <Icon />
      <Frame32 />
      <Button />
      <ButtonsButton />
    </div>
  );
}

function Ax() {
  return (
    <div className="bg-white h-[72px] relative shrink-0 w-full" data-name="Ax">
      <div aria-hidden="true" className="absolute border-[#dfe2e5] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center p-[16px] relative size-full">
          <Frame31 />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#eef4fd] h-[35.996px] relative rounded-[20971500px] shrink-0 w-[364.219px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[20px] left-[16px] not-italic text-[#08479e] text-[14px] top-[8.25px]">Enquiry created for Ramesh Industries - Steel Pipes</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pr-[0.01px] relative w-full">
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="bg-[rgba(242,241,252,0.6)] relative rounded-[76.875px] shrink-0 size-[40px]" data-name="Avatar">
      <p className="-translate-x-1/2 absolute font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold leading-[22px] left-1/2 text-[#665dde] text-[16px] text-center top-[calc(50%-11px)] tracking-[-0.112px] w-[40px] whitespace-pre-wrap">HB</p>
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex items-center pt-[24px] relative shrink-0">
      <Avatar />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[8px] items-center leading-[20px] not-italic relative shrink-0 text-[12px]" data-name="Frame">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#33373d]">Himanshu Bagel</p>
      <p className="font-['Inter:Light',sans-serif] font-light relative shrink-0 text-[#575f68]">12:25 PM</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="bg-[#f2f3f4] relative rounded-[16px] shrink-0 w-full" data-name="Frame">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[12px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#33373d] text-[0px] text-[16px] w-full whitespace-pre-wrap">
            <span className="leading-[24px]">{`Do Androids Dream of Electric Sheep? is a 1968 dystopian science fiction novel by American writer Philip K. `}</span>
            <a className="cursor-pointer leading-[24px]" href="https://en.wikipedia.org/wiki/Do_Androids_Dream_of_Electric_Sheep%3F">
              <span className="leading-[24px]" href="https://en.wikipedia.org/wiki/Do_Androids_Dream_of_Electric_Sheep%3F">
                Dick
              </span>
            </a>
            <span className="leading-[24px]">. Set in a post-apocalyptic San Francisco, the story unfolds after a devastating global war.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
      <Frame18 />
      <Frame19 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex gap-[16px] items-start pr-[80px] relative w-full">
        <Frame34 />
        <Frame35 />
      </div>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <p className="font-['Inter:Light',sans-serif] font-light leading-[20px] not-italic relative shrink-0 text-[#575f68] text-[12px]">12:25 PM</p>
    </div>
  );
}

function Frame21() {
  return (
    <div className="bg-[rgba(242,241,252,0.6)] relative rounded-[16px] shrink-0 w-full" data-name="Frame">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[12px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#33373d] text-[16px] w-full whitespace-pre-wrap">Androids and Humans: The novel explores the uneasy coexistence of humans and androids. Androids, manufactured on Mars, rebel, kill their owners, and escape to Earth, where they hope to remain undetected.</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-end min-h-px min-w-px relative">
      <Frame20 />
      <Frame21 />
    </div>
  );
}

function Avatar1() {
  return (
    <div className="bg-[rgba(242,241,252,0.6)] relative rounded-[76.875px] shrink-0 size-[40px]" data-name="Avatar">
      <p className="-translate-x-1/2 absolute font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold leading-[22px] left-1/2 text-[#665dde] text-[16px] text-center top-[calc(50%-11px)] tracking-[-0.112px] w-[40px] whitespace-pre-wrap">HB</p>
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex items-center pt-[24px] relative shrink-0">
      <Avatar1 />
    </div>
  );
}

function Frame36() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex gap-[16px] items-start pl-[160px] relative w-full">
        <Frame37 />
        <Frame38 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start pt-[15.996px] px-[64px] relative size-full">
        <Container8 />
        <Frame33 />
        <Frame36 />
      </div>
    </div>
  );
}

function Attachment() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="attachment-02">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="attachment-02">
          <path d={svgPaths.p16317500} id="Vector" stroke="var(--stroke-0, #25282D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Frame">
      <p className="font-['Inter:Light',sans-serif] font-light leading-[20px] not-italic relative shrink-0 text-[#25282d] text-[14px]">Type a message</p>
    </div>
  );
}

function Mic() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="mic-01">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="mic-01">
          <path d={svgPaths.p26998500} id="Vector" stroke="var(--stroke-0, #25282D)" strokeLinecap="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame23() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="Frame">
      <div aria-hidden="true" className="absolute border border-[#dfe2e5] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_2px_4px_0px_rgba(10,13,18,0.11)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center p-[12px] relative w-full">
          <Attachment />
          <Frame24 />
          <Mic />
        </div>
      </div>
    </div>
  );
}

function Telegram() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="telegram">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="telegram">
          <path d={svgPaths.p2dc0ba00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function ButtonsButton1() {
  return (
    <div className="bg-[#5249d2] content-stretch flex items-center justify-center p-[12px] relative rounded-[8px] shadow-[0px_4px_8px_0px_rgba(10,13,18,0.12)] shrink-0 size-[48px]" data-name="Buttons/Button">
      <Telegram />
    </div>
  );
}

function Frame22() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center pb-[32px] px-[64px] relative w-full">
          <Frame23 />
          <ButtonsButton1 />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative self-stretch z-[1]" data-name="Container">
      <Ax />
      <Container7 />
      <Frame22 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex isolate items-start left-0 top-[64px] w-[1440px]" data-name="Header">
      <Container />
      <Container2 />
    </div>
  );
}

export default function NewEnquiryPage() {
  return (
    <div className="bg-white relative size-full" data-name="New Enquiry Page">
      <Footer />
      <Header />
    </div>
  );
}