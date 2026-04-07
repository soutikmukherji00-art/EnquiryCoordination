import svgPaths from "./svg-itfrny4oc";

function Badge() {
  return (
    <div className="bg-[#eceef2] h-[24px] relative rounded-[1000px] shrink-0" data-name="Badge">
      <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[8.625px] py-[2.625px] relative rounded-[inherit]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">Awaiting Response</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#33373d] text-[14px]">#ENQ-2401</p>
      <Badge />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[32px] not-italic relative shrink-0 text-[#4039ad] text-[20px]">Ramesh Industries</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start justify-center relative w-full">
        <Frame />
        <Text />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Heading />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#2b7fff] content-stretch flex items-center justify-center left-0 p-[1.875px] rounded-[20971500px] size-[23.994px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.875px] border-solid border-white inset-0 pointer-events-none rounded-[20971500px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[9px] text-center text-white">AK</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[#ad46ff] content-stretch flex items-center justify-center left-[16px] p-[1.875px] rounded-[20971500px] size-[23.994px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.875px] border-solid border-white inset-0 pointer-events-none rounded-[20971500px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[9px] text-center text-white">RM</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[#00c950] content-stretch flex items-center justify-center left-[31.99px] p-[1.875px] rounded-[20971500px] size-[23.994px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.875px] border-solid border-white inset-0 pointer-events-none rounded-[20971500px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[9px] text-center text-white">SR</p>
    </div>
  );
}

function MembersIndicator() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[55.986px]" data-name="MembersIndicator">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container4 />
        <Container5 />
        <Container6 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[8.828px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[4px] not-italic text-[#364153] text-[14px] text-center top-[0.25px] tracking-[-0.1504px]">3</p>
      </div>
    </div>
  );
}

function MembersIndicator1() {
  return (
    <div className="h-[20px] relative shrink-0" data-name="MembersIndicator">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.994px] h-full items-center relative">
        <Text1 />
      </div>
    </div>
  );
}

function Container7() {
  return <div className="bg-[#d1d5dc] h-[15.996px] shrink-0 w-[0.996px]" data-name="Container" />;
}

function Icon() {
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

function Jh() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[24.98px]" data-name="Jh">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.994px] items-center pl-[3.994px] relative size-full">
        <Container7 />
        <Icon />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[40px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] h-full items-center justify-center px-[8.625px] py-[0.625px] relative">
        <MembersIndicator />
        <MembersIndicator1 />
        <Jh />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g clipPath="url(#clip0_2020_1586)" id="Icon">
          <path d={svgPaths.p13ac6080} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p2d592c80} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M6.66504 5.99854H5.33203" id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 8.66455H5.33203" id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 11.3306H5.33203" id="Vector_5" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_2020_1586">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[40px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] h-full items-center px-[11px] py-[8px] relative">
        <Icon1 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_2020_1582)" id="Icon">
          <path d={svgPaths.p2cb69e00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3fe63d80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_2020_1582">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#030213] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative">
        <Icon2 />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[-0.1504px]">Convert to Order</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[40px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] h-full items-center justify-end relative">
        <Button />
        <Button1 />
        <Button2 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative w-full">
        <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
          <Container2 />
        </div>
        <Container3 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
    </div>
  );
}

export default function EnquiryHeader() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pb-[12px] pt-[15.996px] px-[23.994px] relative size-full" data-name="EnquiryHeader">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b-[0.625px] border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}