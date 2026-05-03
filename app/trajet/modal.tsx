import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { trajetRepository } from '../repositories/trajetRepository';
import { CreerTrajetDTO } from '../models/Trajet';

export default function AjouterTrajetModal() {
  const [form, setForm] = useState({
    depart: '',
    arrivee: '',
    date_depart: '',
    places_dispo: '',
    prix: '',
    description: '',
  });
  const [errors, setErrors] = useState({
  depart: '',
  arrivee: '',
  date_depart: '',
  places_dispo: '',
  prix: '',
});

  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const validerFormulaire = () => {
  let valid = true;
  const newErrors = {
    depart: '',
    arrivee: '',
    date_depart: '',
    places_dispo: '',
    prix: '',
  };

  if (!form.depart.trim()) {
    newErrors.depart = 'La ville de départ est obligatoire';
    valid = false;
  }

  if (!form.arrivee.trim()) {
    newErrors.arrivee = "La ville d'arrivée est obligatoire";
    valid = false;
  }

  if (form.depart.trim() === form.arrivee.trim()) {
    newErrors.arrivee = "L'arrivée doit être différente du départ";
    valid = false;
  }

  if (!form.date_depart) {
    newErrors.date_depart = 'La date est obligatoire';
    valid = false;
  } else {
    const dateChoisie = new Date(form.date_depart);
    const maintenant = new Date();
    if (dateChoisie <= maintenant) {
      newErrors.date_depart = 'La date doit être dans le futur';
      valid = false;
    }
  }

  if (!form.places_dispo || parseInt(form.places_dispo) < 1) {
    newErrors.places_dispo = 'Le nombre de places doit être au moins 1';
    valid = false;
  }

  if (!form.prix || parseFloat(form.prix) <= 0) {
    newErrors.prix = 'Le prix doit être supérieur à 0';
    valid = false;
  }

  setErrors(newErrors);
  return valid;
};

  const handleSubmit = async () => {
    if (!validerFormulaire()) return; 
    if (!form.depart || !form.arrivee || !form.date_depart || !form.places_dispo || !form.prix) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    // TODO: retirer quand auth est prête
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'rim.chaieb@enis.tn',
      password: '123',
    });

    if (signInError || !signInData.user) {
      alert('Connexion échouée : ' + signInError?.message);
      setLoading(false);
      return;
    }

    const user = signInData.user;

  //   const { error } = await supabase.from('trajets').insert([{
  //     user_id: user.id,
  //     depart: form.depart,
  //     arrivee: form.arrivee,
  //     date_depart: form.date_depart,
  //     places_dispo: parseInt(form.places_dispo),
  //     prix: parseFloat(form.prix),
  //     description: form.description || null,
  //   }]);

  //   setLoading(false);

  //   if (error) {
  //     alert('Erreur : ' + error.message);
  //   } else {
  //     alert('Trajet ajouté avec succès !');
  //     router.back();
  //   }
  // };
      const trajetData: CreerTrajetDTO = {
      user_id: signInData.user.id,
      depart: form.depart,
      arrivee: form.arrivee,
      date_depart: form.date_depart,
      places_dispo: parseInt(form.places_dispo),
      prix: parseFloat(form.prix),
      description: form.description || undefined,
    };
// Appel du repository — plus de Supabase direct ici !
    const { error } = await trajetRepository.ajouterTrajet(trajetData);

    setLoading(false);

    if (error) {
      alert('Erreur : ' + error.message);
    } else {
      alert('Trajet ajouté avec succès !');
      router.back();
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajouter un trajet</Text>

      <Text style={styles.label}>Ville de départ *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Tunis"
        value={form.depart}
        onChangeText={(val) => setForm({ ...form, depart: val })}
      />
      {errors.depart ? <Text style={styles.errorText}>{errors.depart}</Text> : null}
      <Text style={styles.label}>Ville d'arrivée *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Sousse"
        value={form.arrivee}
        onChangeText={(val) => setForm({ ...form, arrivee: val })}
      />
      {errors.arrivee ? <Text style={styles.errorText}>{errors.arrivee}</Text> : null}
      <Text style={styles.label}>Date et heure *</Text>
      {Platform.OS === 'web' ? (
        <input
          type="datetime-local"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            marginBottom: '10px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
          onChange={(e) => setForm({ ...form, date_depart: e.target.value })}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: form.date_depart ? '#1a1a1a' : '#aaa' }}>
              {form.date_depart || 'Choisir une date et heure'}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  setForm({ ...form, date_depart: selectedDate.toISOString() });
                }
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Nombre de places *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 3"
        keyboardType="numeric"
        value={form.places_dispo}
        onChangeText={(val) => setForm({ ...form, places_dispo: val })}
      />
      {errors.places_dispo ? <Text style={styles.errorText}>{errors.places_dispo}</Text> : null}
      <Text style={styles.label}>Prix (TND) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 15"
        keyboardType="numeric"
        value={form.prix}
        onChangeText={(val) => setForm({ ...form, prix: val })}
      />
      {errors.prix ? <Text style={styles.errorText}>{errors.prix}</Text> : null}
      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Ex: Climatisation disponible..."
        multiline
        numberOfLines={3}
        value={form.description}
        onChangeText={(val) => setForm({ ...form, description: val })}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Envoi en cours...' : 'Ajouter le trajet'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputError: {
  borderColor: '#ef4444',
  borderWidth: 1.5,
},
errorText: {
  color: '#ef4444',
  fontSize: 12,
  marginTop: 4,
  marginBottom: 4,
},
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  textarea: {
    height: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})