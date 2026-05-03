import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'

export default function Register() {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function signUp() {
    if (!nom || !prenom || !email || !password) {
      window.alert('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      window.alert(error.message)
      setLoading(false)
      return
    }

    if (data.user?.identities?.length === 0) {
      window.alert('Un compte existe déjà avec cet email.')
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          nom,
          prenom,
        })

      if (profileError) {
        window.alert(profileError.message)
      } else {
        window.alert('Compte créé avec succès !')
        router.push('/(auth)/login')
      }
    }

    setLoading(false)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={nom}
        onChangeText={setNom}
      />

      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={prenom}
        onChangeText={setPrenom}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={signUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Inscription...' : "S'inscrire"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#000' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 16, fontSize: 16,
    backgroundColor: '#fff', color: '#000'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputFlex: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  eye: { padding: 12 },
  eyeText: { fontSize: 18 },
  button: {
    backgroundColor: '#2563eb', borderRadius: 8,
    padding: 14, alignItems: 'center', marginBottom: 16, marginTop: 8
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#2563eb', fontSize: 14 }
})