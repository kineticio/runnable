<script setup lang="ts">
import { VPDocAsideSponsors } from 'vitepress/theme';
import { sponsors } from './sponsors';

const data = [
  {
    size: 'mini',
    items: sponsors,
  },
];
</script>

<template>
  <VPDocAsideSponsors v-if="data" :data="data" />
</template>
