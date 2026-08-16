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
		// 크림 디지털 가든 라이트 단일 테마. 팔레트 출처: 엉금이 스티커 (등딱지 연두·크림·먹색)
		themes: [
			{
				turtle: {
					"primary": "#3F8636",
					"primary-content": "#FFFFFF",
					"secondary": "#F5EBC4",
					"secondary-content": "#4A431F",
					"accent": "#7CBF6B",
					"accent-content": "#14290F",
					"neutral": "#2B2A20",
					"neutral-content": "#FAF6E8",
					"base-100": "#FBF8EE",
					"base-200": "#F4EDDA",
					"base-300": "#E7DFC2",
					"base-content": "#332F1E",
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
