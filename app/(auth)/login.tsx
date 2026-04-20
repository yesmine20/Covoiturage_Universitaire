import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function signIn() {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      Alert.alert('Erreur', error.message)
      setLoading(false)
      return
    }
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      Alert.alert('Email non vérifié', 'Veuillez vérifier votre email avant de vous connecter.')
      setLoading(false)
      return
    }
    setLoading(false)
  }

async function motDePasseOublie() {
  if (!email) {
    window.alert('Veuillez entrer votre email d\'abord')
    return
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:8081/(auth)/reset-password',
  })
  if (error) {
    window.alert(error.message)
  } else {
    window.alert('Vérifiez votre boîte mail pour réinitialiser votre mot de passe.')
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={motDePasseOublie}>
        <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#000' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 8, fontSize: 16,
    backgroundColor: '#fff', color: '#000'
  },
  forgotLink: { textAlign: 'right', color: '#2563eb', fontSize: 13, marginBottom: 16 },
  button: {
    backgroundColor: '#2563eb', borderRadius: 8,
    padding: 14, alignItems: 'center', marginBottom: 16
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#2563eb', fontSize: 14 }
})