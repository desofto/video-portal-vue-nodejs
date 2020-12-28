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
          Signup
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          Sign in
        </v-card-title>

        <v-card-text>
          <v-text-field 
            label="Email" 
            name="email"
            type="email"
            hide-details="auto" 
            :rules="[rules.required, rules.min8]" 
            v-model="form.email" 
            hint="At least 8 characters"
          />
          
          <v-text-field 
            label="Password" 
            name="password"
            hide-details="auto" 
            :rules="[rules.required, rules.min8]" 
            v-model="form.password" 
            :append-icon="showPasswords ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPasswords = !showPasswords"
            :type="showPasswords ? 'text' : 'password'"
            hint="At least 8 characters"
          />
          
          <v-text-field 
            label="Password confirm" 
            name="passwordConfirm"
            hide-details="auto" 
            :rules="[rules.required, rules.min8]" 
            v-model="form.passwordConfirm" 
            :append-icon="showPasswords ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPasswords = !showPasswords"
            :type="showPasswords ? 'text' : 'password'"
            hint="At least 8 characters"
          />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="signup(form)"
          >
            Sign up
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
      }
    }),

    methods: {
      async signup(form) {
        try {
          await this.$globals.currentUser.signup(form)
          this.dialog = false
        } catch (error) {
          alert("Backend error: " + error)
        }
      }
    }
  }
</script>