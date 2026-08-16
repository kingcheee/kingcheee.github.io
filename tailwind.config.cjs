/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'system-ui', 'Roboto', 'sans-serif'],
				pixel: ['Mona12', '"Mona12 Text KR"', '"Pretendard Variable"', 'sans-serif'],
			},
		},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		// 화이트 + 쨍한 초록 라이트 단일 테마. 팔레트 출처: 거북이 프로필 (초록 배경·등딱지)
		themes: [
			{
				turtle: {
					"primary": "#2F8A25",
					"primary-content": "#FFFFFF",
					"secondary": "#EAF6E4",
					"secondary-content": "#2A5220",
					"accent": "#55B93E",
					"accent-content": "#12300B",
					"neutral": "#242A1F",
					"neutral-content": "#FFFFFF",
					"base-100": "#FFFFFF",
					"base-200": "#F3F7F0",
					"base-300": "#E2EADD",
					"base-content": "#23281E",
					"info": "#5CA8D8",
					"success": "#57A44B",
					"warning": "#D9A520",
					"error": "#C4442A",
					"--rounded-box": "1rem",
					"--rounded-btn": "0.75rem",
				},
			},
		],
		darkTheme: "turtle", // 다크 전환 없음 — 라이트 단일
		logs: false,
	  }
}
