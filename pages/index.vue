<template>
  <v-container
    :fluid="$vuetify.breakpoint.smAndDown"
    class="fill-height"
  >
    <div :class="{ 'pt-6': $vuetify.breakpoint.lgAndUp }">
      <v-btn
        id="go-back-button"
        icon
        color="primary"
        x-large
        :disabled="!parentDirectoryId"
        :ripple="false"
        :to="`/?id=${parentDirectoryId}`"
      >
        <v-icon x-large>
          mdi-arrow-left
        </v-icon>
      </v-btn>
    </div>
    <v-row class="fill-height" :class="{ 'pt-6': $vuetify.breakpoint.lgAndUp }">
      <v-col
        v-for="directory in directories"
        :key="directory._id"
        cols="12"
        sm="6"
        md="3"
        lg="2"
        class="justify-center"
      >
        <v-card
          color="transparent"
          :to="`/?id=${directory._id}`"
          :ripple="false"
          :class="`item-card ${$vuetify.breakpoint.name} elevation-0`"
        >
          <div class="text-center">
            <v-icon
              color="primary"
              :class="`item-icon-${$vuetify.breakpoint.name}`"
            >
              mdi-folder
            </v-icon>
          </div>
          <v-card-title class="text-ellipsis justify-center pa-0">
            {{ directory.name }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col
        v-for="file in files"
        :key="file._id"
        cols="12"
        sm="6"
        md="3"
        lg="2"
        class="justify-center"
      >
        <v-card
          color="transparent"
          :class="`item-card-${$vuetify.breakpoint.name} elevation-0`"
        >
          <div class="text-center">
            <v-icon
              color="primary"
              :class="`item-icon-${$vuetify.breakpoint.name}`"
            >
              mdi-crop-portrait
            </v-icon>
          </div>
          <v-card-title class="text-ellipsis justify-center py-0">
            {{ file.name }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-speed-dial
      fixed
      bottom
      right
      direction="left"
      transition="slide-y-reverse-transition"
    >
      <template v-slot:activator>
        <v-btn fab color="primary">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <input ref="fileInput" type="file" multiple style="display: none">
      </template>
      <v-btn rounded color="primary" @click="openCreateFolderDialog">
        Pasta
        <v-icon right>
          mdi-folder
        </v-icon>
      </v-btn>
      <v-btn rounded color="primary" @click.native="$refs.fileInput.click">
        Arquivo
        <v-icon right>
          mdi-crop-portrait
        </v-icon>
      </v-btn>
    </v-speed-dial>
    <v-dialog
      v-model="createFolderDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>Nome da pasta</v-card-title>
        <v-form @submit.prevent="createFolder">
          <v-card-text>
            <v-text-field
              v-model="newFolderName"
              outlined
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text color="accent" @click="createFolderDialog = false">
              Cancelar
            </v-btn>
            <v-btn type="submit" text :disabled="!newFolderName">
              Criar
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      currentDirectory: null,
      directoryPath: '',
      parentDirectoryId: null,
      files: [],
      directories: [],
      createFolderDialog: false,
      newFolderName: null
    }
  },
  async created () {
    await this.loadMainDirectory(this.$route.query.id)
  },
  mounted () {
    this.$refs.fileInput.onchange = this.uploadFile
  },
  async beforeRouteUpdate (to, from, next) {
    await this.loadMainDirectory(to.query.id)
    next()
  },
  methods: {
    async loadMainDirectory (id) {
      const currentDirectory = await this.$axios.$get('/api/directory', {
        params: { id }
      })

      this.currentDirectory = currentDirectory

      this.directoryPath = (currentDirectory._id === this.parentDirectoryId)
        ? this.directoryPath.replace(/\/(?:.(?!\/))+$/, '')
        : (
          this.directoryPath
            ? `${this.directoryPath}/${currentDirectory.name}`
            : currentDirectory.name
        )

      this.parentDirectoryId = currentDirectory.parentDirectory

      await this.loadDirectories(currentDirectory.directories)
      await this.loadFiles(currentDirectory.files)
    },
    async loadDirectories (directories, append = false) {
      if (!append) this.directories = []

      for (const id of directories) {
        const directory = await this.$axios.$get('/api/directory', {
          params: { id }
        })

        this.directories.push(directory)
      }
    },
    async loadFiles (files, append = false) {
      if (!append) this.files = []

      for (const id of files) {
        const file = await this.$axios.$get(`/api/file/${id}`)
        this.files.push(file)
      }
    },
    openCreateFolderDialog () {
      this.newFolderName = ''
      this.createFolderDialog = true
    },
    async createFolder () {
      const newFolderPath = `${this.directoryPath}/${this.newFolderName}`

      const { id: newFolderId } = await this.$axios.$post('/api/directory', {
        path: newFolderPath
      })

      await this.loadDirectories([ newFolderId ], true)
      this.createFolderDialog = false
    },
    async uploadFile ({ target: { files } }) {
      if (files.length === 0) return

      const formData = new FormData()

      for (const file of files)
        formData.append('data', file)

      const filesCreated = await this.$axios.$post('/api/file', formData, {
        params: {
          directoryPath: this.directoryPath,
          directoryId: this.currentDirectory._id
        }
      })

      await this.loadFiles(filesCreated, true)
    }
  }
}
</script>

<style scoped>
#go-back-button::before {
  background: none !important;
}

.text-ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.item-card {
  margin: auto;
}

.item-card::before {
  background: none !important;
}

.item-card.xl {
  width: 160px;
}

.item-card.md,
.item-card.sm,
.item-card.xs,
.item-card.lg {
  width: 128px;
}

.item-icon-xl {
  font-size: 160px;
}

.item-icon-md,
.item-icon-sm,
.item-icon-xs,
.item-icon-lg {
  font-size: 128px;
}
</style>
