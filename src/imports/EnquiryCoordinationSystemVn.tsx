import svgPaths from "./svg-vw5obclyny";

function Container1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative w-full">
        <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] min-h-px min-w-px not-italic overflow-hidden relative text-[#0a0a0a] text-[18px] text-ellipsis tracking-[-0.4395px] whitespace-nowrap">Enquiry Coordination System</p>
      </div>
    </div>
  );
}

function PersonaSwitcher() {
  return (
    <div className="bg-[#2b7fff] relative rounded-[20971500px] shrink-0 size-[23.994px]" data-name="PersonaSwitcher">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white">AK</p>
      </div>
    </div>
  );
}

function PersonaSwitcher1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[122.861px]" data-name="PersonaSwitcher">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0a0a0a] text-[14px] top-[0.25px] tracking-[-0.1504px]">Amit Kumar (BDM)</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d={svgPaths.p1a395280} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[31.992px] relative rounded-[8px] shrink-0 w-[200.098px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.998px] items-center justify-center p-[0.625px] relative size-full">
        <PersonaSwitcher />
        <PersonaSwitcher1 />
        <Icon />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[55.996px] relative shrink-0 w-[393.75px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.625px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[0.625px] px-[15.996px] relative size-full">
        <Container1 />
        <Button />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p33f6b680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M15.8333 10H4.16667" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[43.994px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[81.748px]" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] top-[-0.5px] tracking-[-0.3125px]">ENQ-2404</p>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#eceef2] h-[21.23px] relative rounded-[8px] shrink-0 w-[46.68px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.625px] py-[2.625px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">Draft</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[7.998px] h-[23.994px] items-center relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Badge />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-[0.63px]">Draft</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[39.99px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container4 />
        <Paragraph />
      </div>
    </div>
  );
}

function MobileConversationWithTabs() {
  return (
    <div className="h-[68.604px] relative shrink-0 w-full" data-name="MobileConversationWithTabs">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b-[0.625px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.992px] items-center pb-[0.625px] pl-[7.998px] pr-[15.996px] relative size-full">
          <Button1 />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return <div className="absolute bg-[#155dfc] h-[1.992px] left-0 top-[41.99px] w-[196.875px]" data-name="Container" />;
}

function Button2() {
  return (
    <div className="absolute h-[43.984px] left-0 top-0 w-[196.875px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[98.83px] not-italic text-[#155dfc] text-[14px] text-center top-[12.24px] tracking-[-0.1504px]">Chat</p>
      <Container5 />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute h-[43.984px] left-[196.88px] top-0 w-[196.875px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[98.69px] not-italic text-[#4a5565] text-[14px] text-center top-[12.24px] tracking-[-0.1504px]">Details</p>
    </div>
  );
}

function MobileConversationWithTabs1() {
  return (
    <div className="bg-white h-[44.609px] relative shrink-0 w-full" data-name="MobileConversationWithTabs">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b-[0.625px] border-solid inset-0 pointer-events-none" />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-[393.75px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <MobileConversationWithTabs />
        <MobileConversationWithTabs1 />
      </div>
    </div>
  );
}

function MobileShell() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="MobileShell">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <Container2 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#f3f4f6] h-[55.996px] relative rounded-[20971500px] shrink-0 w-[345.762px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#4a5565] text-[14px] top-[8.25px] tracking-[-0.1504px] w-[293px] whitespace-pre-wrap">Enquiry created for Ramesh Industries - Steel Pipes</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="flex-[1_0_0] h-[71.992px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex h-[71.992px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[24.541px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.25px] tracking-[-0.1504px]">You</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[15.996px] left-[32.54px] top-[2.5px] w-[27.1px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-[0.63px]">BDM</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[15.996px] left-[67.64px] top-[2.5px] w-[51.592px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.63px]">11:26 AM</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[257.793px]" data-name="Container">
      <Text />
      <Text1 />
      <Text2 />
    </div>
  );
}

function MessageContentWithAi() {
  return (
    <div className="absolute h-[56.875px] left-0 top-[25.24px] w-[232.178px]" data-name="MessageContentWithAI">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#364153] text-[14px] top-[-1px] tracking-[-0.1504px] w-[233px] whitespace-pre-wrap">@Meera - Ramesh needs 500 units industrial steel pipes, Grade 304, 2-inch for Chennai.</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[15.996px] left-0 top-[87.99px] w-[257.793px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-[0.63px] w-[217px] whitespace-pre-wrap">Mentioned: Meera Iyer (CM - Polymer)</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[103.984px] left-[43.98px] top-0 w-[257.793px]" data-name="Container">
      <Container13 />
      <MessageContentWithAi />
      <Container14 />
    </div>
  );
}

function Text3() {
  return (
    <div className="bg-[#ececf0] flex-[1_0_0] h-[31.992px] min-h-px min-w-px relative rounded-[20971500px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] tracking-[-0.3125px]">AM</p>
      </div>
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="absolute content-stretch flex items-start left-0 overflow-clip rounded-[20971500px] size-[31.992px] top-0" data-name="Primitive.span">
      <Text3 />
    </div>
  );
}

function Container15() {
  return <div className="absolute bg-[#00c950] border-[1.875px] border-solid border-white left-[21.99px] rounded-[20971500px] size-[10px] top-[21.99px]" data-name="Container" />;
}

function AvatarWithStatus() {
  return (
    <div className="absolute left-0 size-[31.992px] top-[3.99px]" data-name="AvatarWithStatus">
      <PrimitiveSpan />
      <Container15 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[103.984px] relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <AvatarWithStatus />
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[24.541px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.25px] tracking-[-0.1504px]">You</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute h-[15.996px] left-[32.54px] top-[2.5px] w-[27.1px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-[0.63px]">BDM</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute h-[15.996px] left-[67.64px] top-[2.5px] w-[51.67px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.63px]">11:30 AM</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[257.793px]" data-name="Container">
      <Text4 />
      <Text5 />
      <Text6 />
    </div>
  );
}

function SkuHighlightLayer() {
  return (
    <div className="absolute content-stretch flex h-[16.875px] items-start left-0 top-[1.25px] w-[152.881px]" data-name="SKUHighlightLayer">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] tracking-[-0.1504px]">{`Also adding 50 bags of `}</p>
    </div>
  );
}

function SkuHighlightLayer1() {
  return (
    <div className="absolute bg-[#dbeafe] h-[36.875px] left-0 rounded-[4px] top-[1.25px] w-[242.266px]" data-name="SKUHighlightLayer">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#1c398e] text-[14px] top-[-1px] tracking-[-0.1504px] w-[243px] whitespace-pre-wrap">Cement OPC 53</p>
    </div>
  );
}

function SkuHighlightLayer2() {
  return (
    <div className="absolute content-stretch flex h-[16.875px] items-start left-[19.13px] top-[21.25px] w-[175.186px]" data-name="SKUHighlightLayer">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] tracking-[-0.1504px]">{` grade for the same project`}</p>
    </div>
  );
}

function MessageContentWithAi1() {
  return (
    <div className="absolute h-[40px] left-0 top-[23.99px] w-[257.793px]" data-name="MessageContentWithAI">
      <SkuHighlightLayer />
      <SkuHighlightLayer1 />
      <SkuHighlightLayer2 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[11.99px] size-[11.992px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9922 11.9922">
        <g clipPath="url(#clip0_2083_785)" id="Icon">
          <path d={svgPaths.p1b927a00} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d="M9.99349 1.49902V3.49772" id="Vector_2" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d="M10.9928 2.49837H8.99414" id="Vector_3" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d="M1.9987 8.49447V9.49381" id="Vector_4" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d="M2.49837 8.99414H1.49902" id="Vector_5" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_2083_785">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[15.996px] left-[29.98px] top-[6px] w-[54.443px]" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[27px] not-italic text-[#1447e6] text-[12px] text-center top-[0.63px]">AI Insight</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute h-[15.996px] left-[90.42px] top-[6px] w-[3.77px]" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[2px] not-italic text-[#155dfc] text-[12px] text-center top-[0.63px]">·</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="absolute h-[15.996px] left-[100.19px] top-[6px] w-[117.471px]" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[59.5px] not-italic text-[#155dfc] text-[12px] text-center top-[0.63px]">Price trend available</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[225.64px] size-[11.992px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9922 11.9922">
        <g id="Icon">
          <path d={svgPaths.pd502a00} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function AiInsightChip() {
  return (
    <div className="absolute bg-[#eff6ff] h-[27.988px] left-0 rounded-[20971500px] top-[69.99px] w-[249.629px]" data-name="AIInsightChip">
      <Icon2 />
      <Text7 />
      <Text8 />
      <Text9 />
      <Icon3 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[97.979px] left-[43.98px] top-0 w-[257.793px]" data-name="Container">
      <Container18 />
      <MessageContentWithAi1 />
      <AiInsightChip />
    </div>
  );
}

function Text10() {
  return (
    <div className="bg-[#ececf0] flex-[1_0_0] h-[31.992px] min-h-px min-w-px relative rounded-[20971500px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] tracking-[-0.3125px]">AM</p>
      </div>
    </div>
  );
}

function PrimitiveSpan1() {
  return (
    <div className="absolute content-stretch flex items-start left-0 overflow-clip rounded-[20971500px] size-[31.992px] top-0" data-name="Primitive.span">
      <Text10 />
    </div>
  );
}

function Container19() {
  return <div className="absolute bg-[#00c950] border-[1.875px] border-solid border-white left-[21.99px] rounded-[20971500px] size-[10px] top-[21.99px]" data-name="Container" />;
}

function AvatarWithStatus1() {
  return (
    <div className="absolute left-0 size-[31.992px] top-[3.99px]" data-name="AvatarWithStatus">
      <PrimitiveSpan1 />
      <Container19 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[97.979px] relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <AvatarWithStatus1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[337.939px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[15.996px] items-start pt-[15.996px] px-[23.994px] relative size-full">
        <Container8 />
        <Container11 />
        <Container16 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[393.75px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container7 />
      </div>
    </div>
  );
}

function ConversationPanel() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="ConversationPanel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[878.75px] items-start overflow-clip relative shrink-0 w-full" data-name="AppContent">
      <Container />
      <MobileShell />
      <ConversationPanel />
    </div>
  );
}

function Textarea() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[44px] left-0 rounded-[8px] top-0 w-[266px]" data-name="Textarea">
      <div className="content-stretch flex items-start overflow-clip pl-[12px] pr-[48px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0)] tracking-[-0.3125px]">Type a message... Use @ for commands and mentions</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[8px] size-[15.996px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g clipPath="url(#clip0_2083_795)" id="Icon">
          <path d={svgPaths.p22681c0} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p41b4200} id="Vector_2" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_2083_795">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[31.992px]" data-name="Button">
      <Icon4 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[8px] h-[44px] items-center justify-end px-[8px] relative shrink-0 w-[266px]" data-name="Container">
      <Textarea />
      <Button4 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3b56c872} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pb4beb80} id="Vector_2" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 15.8333V18.3333" id="Vector_3" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex items-center justify-center pr-[0.01px] relative rounded-[8px] shrink-0 size-[43.994px]" data-name="Button">
      <Icon5 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_2083_781)" id="Icon">
          <path d={svgPaths.p36f10880} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p8bd79c0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_2083_781">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#030213] content-stretch flex items-center justify-center pr-[0.01px] relative rounded-[8px] shrink-0 size-[43.994px]" data-name="Button">
      <Icon6 />
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Container22 />
        <Button5 />
        <Button6 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute bg-white bottom-[0.16px] content-stretch flex flex-col items-start left-0 pb-[11.992px] pl-[11.992px] pt-[12.617px] w-[393.75px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-solid border-t-[0.625px] inset-0 pointer-events-none" />
      <Container21 />
    </div>
  );
}

export default function EnquiryCoordinationSystemVn() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Enquiry Coordination System Vn">
      <AppContent />
      <Container20 />
    </div>
  );
}