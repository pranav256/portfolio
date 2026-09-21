import type { ProjectId } from "@/lib/projects";

export function ProjectArt({ project }: { project: ProjectId }) {
  if (project === "hooky") {
    return (
      <svg viewBox="0 0 640 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="project-art">
        <circle cx="260" cy="222" r="157" fill="var(--background)" />
        <g className="cover-layer" transform="rotate(-9 254 220)">
          <rect x="63" y="103" width="336" height="224" rx="12" fill="var(--foreground)" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <g key={i} fill="var(--background)"><rect x={79 + i * 31} y="114" width="15" height="9" rx="2" /><rect x={79 + i * 31} y="307" width="15" height="9" rx="2" /></g>)}
          <rect x="81" y="137" width="92" height="155" rx="3" fill="var(--accent)" />
          <rect x="184" y="137" width="94" height="155" rx="3" fill="var(--primary)" />
          <rect x="289" y="137" width="92" height="155" rx="3" fill="var(--accent)" />
          <path d="M91 255l28-48 42 70H91z" fill="var(--primary)" />
          <circle cx="144" cy="166" r="15" fill="var(--primary)" />
          <path d="M205 168v95l56-48z" fill="var(--background)" />
          <path d="M299 277v-52c0-43 71-43 71 0v52" stroke="var(--foreground)" strokeWidth="1.5" />
          <path d="M312 277v-48c0-29 45-29 45 0v48" stroke="var(--foreground)" strokeWidth="1.5" />
        </g>
        <g className="cover-layer-secondary" transform="rotate(8 458 218)">
          <rect x="408" y="72" width="137" height="278" rx="16" fill="var(--background)" stroke="var(--foreground)" strokeWidth="1.5" />
          <rect x="418" y="84" width="117" height="236" rx="9" fill="var(--primary)" />
          <circle cx="476" cy="156" r="29" fill="var(--accent)" />
          <path d="M424 245l53-67 50 67z" fill="var(--foreground)" />
          <path d="M441 270h70M452 281h49" stroke="var(--background)" strokeWidth="6" strokeLinecap="round" />
          <path d="M462 336h28" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path d="M360 66c32-33 68-30 77-7M426 51l12 10 7-12M79 362c62 35 128 32 168 1" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M562 153h21M573 142v22" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (project === "vault") {
    return (
      <svg viewBox="0 0 560 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="project-art">
        <g stroke="var(--background)" opacity=".14" strokeWidth="1">
          <ellipse cx="280" cy="180" rx="219" ry="82" transform="rotate(-20 280 180)" />
          <ellipse cx="280" cy="180" rx="219" ry="82" transform="rotate(20 280 180)" />
          <ellipse cx="280" cy="180" rx="219" ry="82" transform="rotate(60 280 180)" />
        </g>
        <g className="cover-layer">
          <path d="M229 152v-42c0-65 102-65 102 0v42" stroke="var(--primary)" strokeWidth="18" />
          <path d="M229 145v-35c0-65 102-65 102 0v35" stroke="var(--accent)" strokeWidth="1.5" opacity=".65" />
          <rect x="196" y="143" width="169" height="130" rx="16" fill="var(--background)" />
          <rect x="207" y="155" width="146" height="105" rx="10" stroke="var(--foreground)" strokeWidth="1" opacity=".25" />
          <circle cx="281" cy="193" r="13" fill="var(--foreground)" />
          <path d="M276 198h10l6 30h-22z" fill="var(--foreground)" />
          <path d="M219 170h19M219 177h9" stroke="var(--foreground)" strokeWidth="1" opacity=".4" />
        </g>
        <circle cx="415" cy="111" r="7" fill="var(--primary)" />
        <path d="M139 217v22M128 228h22M391 249l7 7 12-17" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 560 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="project-art">
      <circle cx="267" cy="160" r="123" fill="var(--accent)" />
      <g className="cover-layer-secondary" transform="rotate(10 322 163)">
        <rect x="225" y="53" width="170" height="224" rx="4" fill="var(--background)" stroke="var(--foreground)" strokeWidth="1.3" />
        <path d="M247 77h107M247 86h68" stroke="var(--foreground)" opacity=".4" />
        <path d="M247 195h107M247 207h107M247 219h63M247 242h107M247 251h80" stroke="var(--foreground)" opacity=".3" />
      </g>
      <g className="cover-layer" transform="rotate(-10 247 163)">
        <rect x="151" y="35" width="177" height="234" rx="4" fill="var(--card)" stroke="var(--foreground)" strokeWidth="1.3" />
        <path d="M173 64h71M173 74h41" stroke="var(--foreground)" strokeWidth="2" />
        <path d="M173 90h132" stroke="var(--foreground)" opacity=".35" />
        <path d="M214 114c-21 0-12 22-23 31 11 10 2 32 23 32M266 114c21 0 12 22 23 31-11 10-2 32-23 32" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="240" cy="146" r="5" fill="var(--primary)" />
        <path d="M173 206h132M173 217h132M173 228h80M173 251h32" stroke="var(--foreground)" strokeWidth="1" opacity=".35" />
      </g>
      <path d="M395 64h24M407 52v24M115 222c-9 17-3 33 13 34" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="421" cy="227" r="5" fill="var(--primary)" />
    </svg>
  );
}
