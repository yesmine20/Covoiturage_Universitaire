import { View, Text, StyleSheet } from 'react-native';

export default function TrajetsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Trajets disponibles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  titre: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 60,
  },
});