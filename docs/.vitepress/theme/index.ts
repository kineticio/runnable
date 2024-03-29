import Theme from 'vitepress/theme';
import '../style/main.css';
import '../style/vars.css';
import HomeSponsors from './components/HomeSponsors.vue';
import AsideSponsors from './components/AsideSponsors.vue';
import SvgImage from './components/SvgImage.vue';
import { h } from 'vue';

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomeSponsors),
      'aside-ads-before': () => h(AsideSponsors),
    });
  },
  enhanceApp({ app }) {
    app.component('SvgImage', SvgImage);
  },
};
