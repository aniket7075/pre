import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';

const NoticeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await apiClient.get('/notices?school_id=dummy_school_id');
        setNotices(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotices();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notice Board</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4da6ff" />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No new notices.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ffcc00' },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold' }
});

export default NoticeScreen;
