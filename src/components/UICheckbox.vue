<template>
  <van-checkbox-group v-model="internalValue">
    <van-checkbox
      v-for="option in options"
      :name="option.value"
      :key="option.value"
    >
      {{ option.label }}
    </van-checkbox>
  </van-checkbox-group>
</template>

<script>

export default {
  name: 'custom-checkbox',

  props: {
    options: {
      type: Array,
      required: true,
    },
    
    value: {
      type: Array,
      default: () => ([]),
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

