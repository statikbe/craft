import { h } from 'vue';
import type { Theme } from 'vitepress';
import './style.css';
import DynamicLayout from '../components/DynamicLayout.vue';

export default {
  Layout: DynamicLayout,
} satisfies Theme;
