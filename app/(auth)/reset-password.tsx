import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updatePassword() {
    if (!password || !confirm) {
      window.alert('Veuillez remplir tous les champs')
      return
    }
    if (password !== confirm) {
      window.alert('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      window.alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      window.alert(error.message)
    } else {
      window.alert('Mot de passe mis à jour !')
      router.replace('/(auth)/login')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau mot de passe</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setShowConfirm(!showConfirm)}>
          <Text style={styles.eyeText}>{showConfirm ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={updatePassword} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Mise à jour...' : 'Confirmer'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#000' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  eye: {
    padding: 12,
  },
  eyeText: {
    fontSize: 18,
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 8,
    padding: 14, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})