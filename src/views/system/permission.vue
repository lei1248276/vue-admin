<template>
  <div class="app-container">
    <switch-roles @change="handleRolesChange" />
    <role />
  </div>
</template>

<script>
import SwitchRoles from './components/SwitchRoles';
import Role from './components/Role';

export default {
  name: 'PermissionSystem',
  components: { SwitchRoles, Role },
  methods: {
    handleRolesChange() {
      this.$router.push({ path: '/permission/index?' + +new Date() });
    }
  }
};
</script>
