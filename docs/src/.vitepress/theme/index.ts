import Theme from 'vitepress/theme'
import './style.css';
import DynamicLayout from '../components/DynamicLayout.vue';
import FooterLogo from '../components/FooterLogo.vue';
import {h} from "vue";

export default {
    ...Theme,
    Layout() {
        return h(Theme.Layout, null, {
                'aside-bottom': () => h(FooterLogo)
            }
        )
    }
}