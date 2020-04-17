<template>
  <v-app>
    <v-app-bar app flat color="transparent">
      <v-toolbar-title class="py-0">
        <v-icon left color="primary">
          mdi-cloud
        </v-icon>
        <span class="hidden-sm-and-down">Personal Cloud</span>
      </v-toolbar-title>
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>
