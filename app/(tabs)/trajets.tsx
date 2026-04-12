// import { View, Text, StyleSheet } from 'react-native';

// export default function TrajetsScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.titre}>Trajets disponibles</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   titre: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginTop: 60,
//   },
// });


import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// TouchableOpacity c'est un bouton cliquable en React Native
import { router } from 'expo-router';

export default function TrajetsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titre}>Trajets disponibles</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/trajet/modal')}
        >
          <Text style={styles.buttonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
  },
  titre: {
    fontSize: 22,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});