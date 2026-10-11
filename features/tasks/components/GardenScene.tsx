/** Lightweight, scalable garden illustration; decorative, with no remote assets. */
export function GardenScene() {
  return (
    <svg
      className="garden-scene"
      viewBox="0 0 300 250"
      fill="none"
      aria-hidden="true"
    >
      <path fill="#dff3e7" d="M0 0h300v250H0z" />
      <circle cx="267" cy="71" r="46" fill="#fff3b9" />
      <path
        d="M20 65c0-12 15-19 23-9 8-22 38-19 41 3 15-2 24 9 20 19H20zM168 31c4-12 19-11 24-3 9-15 28-11 29 5 12-1 19 6 17 15h-70z"
        fill="#f9fcf0"
      />
      <path
        d="M0 173c54-35 99-24 137 8 55-53 98-58 163-22v91H0z"
        fill="#c7e8bd"
      />
      <path
        d="M0 200c71-52 155 15 198-8 53-30 73-11 102-8v66H0z"
        fill="#a9d49a"
      />
      <path
        d="M0 228c55-27 96-9 144-13 57-4 102-29 156-8v43H0z"
        fill="#8ebc73"
      />
      <g stroke="#4e9461" strokeWidth="3" strokeLinecap="round">
        <path d="M24 203c8-43 3-69-7-94M41 213c-8-24-9-37-4-67M276 209c-1-41 3-62 12-81M265 220c-4-27-8-42-19-62" />
      </g>
      <path
        d="M20 159C-3 160-4 133 0 126c17 1 26 14 20 33zM25 181c21-4 27-22 22-31-19 0-25 16-22 31zM17 134C1 128 5 104 10 97c16 8 19 23 7 37z"
        fill="#6db782"
      />
      <path
        d="M279 170c-23-4-31-28-24-37 23 6 29 19 24 37zM280 183c19-6 29-24 20-36-20 4-27 17-20 36zM288 147c-9-10-9-32 1-41 15 11 12 31-1 41zM264 188c-17-3-28-18-24-31 19 0 27 15 24 31z"
        fill="#7bbb8d"
      />
      <ellipse
        cx="104"
        cy="224"
        rx="55"
        ry="9"
        fill="#76a85d"
        fillOpacity=".35"
      />
      <g className="garden-plant">
        <path
          d="M102 171c0-32-5-61 9-101"
          stroke="#548c40"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M108 108c-9-29-36-36-49-23 1 22 17 38 47 34" fill="#8cbd51" />
        <path d="M106 92c31 5 54-20 44-43-24-2-44 15-44 43" fill="#a6cf60" />
        <path d="M103 146c-24-4-34-28-25-41 21 3 30 17 25 41" fill="#6ba94d" />
        <path d="M104 150c29 0 47-19 39-37-22-3-37 12-39 37" fill="#93c35b" />
        <path
          d="M106 113 72 95M111 83l25-24M103 137l-17-23M110 141l23-19"
          stroke="#65973e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="m76 173 9 46c15 9 37 9 46 0l8-46" fill="#d9955d" />
        <path d="m84 177 8 38c8 6 16 5 20 5l-5-43" fill="#ecaf6e" />
        <rect x="71" y="165" width="73" height="15" rx="5" fill="#e5a367" />
        <ellipse cx="107" cy="166" rx="31" ry="5" fill="#8d613e" />
        <ellipse cx="107" cy="166" rx="25" ry="3" fill="#735137" />
        <path d="M101 170v-7" stroke="#548c40" strokeWidth="4" />
      </g>
      <g stroke="#648b4e" strokeWidth="2" strokeLinecap="round">
        <path d="M216 226v-18M230 227l5-24M240 229l10-13M43 226l-3-15" />
      </g>
      <g fill="#f8d573">
        <ellipse
          cx="216"
          cy="205"
          rx="5"
          ry="10"
          transform="rotate(-30 216 205)"
        />
        <ellipse
          cx="229"
          cy="205"
          rx="5"
          ry="10"
          transform="rotate(35 229 205)"
        />
        <ellipse
          cx="247"
          cy="213"
          rx="4"
          ry="8"
          transform="rotate(45 247 213)"
        />
      </g>
      <path
        d="m39 91 3-7 3 7 7 3-7 3-3 7-3-7-7-3zM163 126l2-5 2 5 5 2-5 2-2 5-2-5-5-2z"
        fill="#fff6ce"
      />
      <circle cx="60" cy="203" r="3" fill="#fbe09a" />
      <circle cx="169" cy="218" r="3" fill="#eaf3ce" />
    </svg>
  );
}
