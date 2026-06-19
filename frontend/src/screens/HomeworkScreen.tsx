import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';

const HomeworkScreen = () => {
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState([]);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const response = await apiClient.get('/homework/dummy_section_id');
        setHomework(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomework();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Homework & Assignments</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4da6ff" />
      ) : (
        <FlatList
          data={homework}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>Due: {item.due_date}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No homework assigned.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ff6699' },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold' }
});

export default HomeworkScreen;
