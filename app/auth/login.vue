<template>
  <div>
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="blue lighten-2"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Login
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          Log in
        </v-card-title>

        <v-card-text>
          <v-form ref="form" class="mx-2" lazy-validation>
            <v-text-field
              label="Email"
              name="email"
              type="email"
              hide-details="auto"
              :rules="[rules.required, rules.email]"
              v-model="form.email"
            />

            <v-text-field
              label="Password"
              name="password"
              hide-details="auto"
              :rules="[rules.required]"
              v-model="form.password"
              :append-icon="showPasswords ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPasswords = !showPasswords"
              :type="showPasswords ? 'text' : 'password'"
            />
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="login(form)"
          >
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    data: () => ({
      dialog: false,
      form: {},
      showPasswords: false,

      rules: {
        required: value => !!value || 'Required.',
        min8: value => (value && value.length >= 8) || 'Min 8 characters',
        email: value => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) || 'E-mail must be valid',
      }
    }),

    methods: {
      async login(form) {
        try {
          if(!this.$refs.form.validate()) return
          await this.$globals.currentUser.login(form)
          this.dialog = false
        } catch (error) {
          alert("Backend error: " + error)
        }
      }
    }
  }
</script>