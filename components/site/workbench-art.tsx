export function WorkbenchArt() {
  return (
    <svg viewBox="0 0 560 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="workbench-art" aria-hidden="true">
      <defs>
        <pattern id="workbench-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <path d="M0 0V7" stroke="currentColor" strokeWidth="1" opacity=".16" />
        </pattern>
        <pattern id="workbench-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".9" fill="currentColor" opacity=".18" />
        </pattern>
      </defs>
      <circle cx="325" cy="239" r="190" fill="var(--accent)" />
      <path d="M484 240c25 42 20 114-6 151-26 39-54 55-96 70" stroke="currentColor" strokeDasharray="2 8" opacity=".3" />
      <ellipse cx="284" cy="445" rx="213" ry="21" fill="url(#workbench-hatch)" />
      <g className="art-sun" data-art-layer="sun">
        <circle cx="432" cy="103" r="40" fill="var(--primary)" />
        <g stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
          <path d="M432 46V34M432 172v-12M489 103h12M362 103h12M472 62l9-9M382 153l9-9M391 62l-9-9M482 153l-9-9" />
        </g>
        <path d="M418 103c8 8 19 8 27 0" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="419" cy="90" r="2" fill="var(--background)" />
        <circle cx="445" cy="90" r="2" fill="var(--background)" />
      </g>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M136 163l35-18h236c10 0 17 8 17 18v176l-23 22-259-7z" fill="var(--accent)" />
        <path d="M403 164l21-10M403 335l21-15M411 172v145" opacity=".4" />
        <rect x="124" y="161" width="279" height="199" rx="19" fill="var(--background)" />
        <rect x="141" y="178" width="245" height="156" rx="9" fill="var(--foreground)" />
        <path d="M230 360l-9 39h85l-10-39" fill="var(--background)" />
        <path d="M233 373h60l5 22h-70" fill="url(#workbench-hatch)" stroke="none" />
        <path d="M210 399h109l14 10H196z" fill="var(--background)" />
        <circle cx="263" cy="348" r="3" fill="var(--primary)" stroke="none" />
        <path d="M370 343h8M370 348h8" strokeWidth="1" opacity=".5" />
      </g>
      <g stroke="var(--background)" strokeWidth="2" strokeLinecap="round" opacity=".8">
        <path d="M175 209l8 7-8 7M194 225h46" />
        <path d="M175 248h63M175 262h104M175 276h45" opacity=".32" />
        <path d="M236 276h65" opacity=".6" />
      </g>
      <g className="art-cursor" transform="translate(332 239)" fill="var(--primary-foreground)">
        <path d="M0 0v32l8-8 7 15 6-3-7-14h13z" />
      </g>
      <text x="174" y="306" fontFamily="var(--font-mono)" fontSize="11" fill="var(--background)" opacity=".85">hello, world.</text>
      <g className="art-note" data-art-layer="note" transform="rotate(-13 104 254)" stroke="currentColor" strokeWidth="1.5">
        <path d="M47 216h91l16 18v98H47z" fill="var(--card)" />
        <path d="M138 216v18h16M60 233h25M60 241h39" opacity=".35" />
        <path d="M84 266c-11 0-7 13-13 17 6 4 2 17 13 17M116 266c11 0 7 13 13 17-6 4-2 17-13 17" stroke="var(--primary)" strokeWidth="2.5" />
        <path d="M94 293l12-23" stroke="var(--primary)" strokeWidth="2.5" />
        <path d="M61 316h42" opacity=".35" />
      </g>
      <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M119 411h207l34 31H100z" fill="var(--background)" />
        <path d="M100 442v6h260v-6M131 418h185l17 17H119z" fill="var(--accent)" />
        <path d="M128 426h195M145 419l-4 15M165 419l-2 15M186 419v15M206 419l2 15M227 419l3 15M248 419l4 15M269 419l5 15M290 419l6 15" strokeWidth=".8" opacity=".6" />
      </g>
      <g className="art-plant" data-art-layer="plant">
        <path d="M458 343c-7-50-8-70-4-104M455 286c21-13 33-25 43-46M452 310c-19-17-32-35-35-54" stroke="currentColor" strokeWidth="1.8" />
        <path d="M454 269c-20-5-27-24-15-44 21 9 29 22 15 44ZM464 280c3-25 20-39 40-32-4 22-21 37-40 32ZM441 303c-22 1-37-9-34-33 23-2 36 10 34 33Z" fill="var(--primary)" />
        <path d="M432 335h47l-6 53h-35z" fill="var(--background)" stroke="currentColor" strokeWidth="1.6" />
        <path d="M438 343h34l-4 39h-26z" fill="url(#workbench-hatch)" />
        <path d="M432 344h47" stroke="currentColor" strokeWidth="1.4" />
      </g>
      <g stroke="currentColor" strokeWidth="1.6">
        <path d="M390 403h36v26c0 13-36 13-36 0z" fill="var(--primary)" />
        <ellipse cx="408" cy="403" rx="18" ry="5" fill="var(--background)" />
        <path d="M426 408h7c15 0 15 19 0 19h-7" />
        <path d="M401 389c-8-12 10-12 2-25M414 388c-8-12 10-12 2-25" opacity=".35" strokeLinecap="round" />
      </g>
      <path d="M77 145h33M93 129v33" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="172" cy="112" r="24" fill="url(#workbench-dots)" />
      <path d="M231 103c36-36 74-20 65 3-7 20-34 14-29 1 6-16 39-9 58 13" stroke="currentColor" strokeWidth="1.3" opacity=".4" strokeLinecap="round" />
    </svg>
  );
}
