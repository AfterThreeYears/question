<template>
  <van-radio-group v-model="internalValue">
    <van-radio
      v-for="option in options"
      :name="option.value"
      :key="option.value"
    >
      {{ option.label }}
    </van-radio>
  </van-radio-group>
</template>

<script>

export default {
  name: 'custom-radio',

  props: {
    options: {
      type: Array,
      required: true,
    },
    
    value: {
      type: [String, Number],
    }
  },

  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    }
  },
};
</script>

