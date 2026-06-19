import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const ParentDashboard: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  const features = [
    { title: 'Attendance', icon: '📅', screen: 'Attendance' },
    { title: 'Homework', icon: '📚', screen: 'Homework' },
    { id: '4', title: 'Fees', icon: 'cash', screen: 'Fees', color: '#ff9933' },
    { id: '5', title: 'Transport', icon: 'bus', screen: 'Transport', color: '#cc66ff' },
    { id: '6', title: 'Chat', icon: 'chatbubbles', screen: 'Chat', color: '#66ccff' },
    { id: '7', title: 'Progress', icon: 'bar-chart', screen: 'Progress', color: '#ff6699' },
    { id: '8', title: 'Results', icon: 'school', screen: 'Results', color: '#4da6ff' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Parent Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {features.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card} 
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: '#4da6ff', paddingTop: 50 
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  card: { 
    width: width / 2 - 20, backgroundColor: '#fff', padding: 20, 
    borderRadius: 15, alignItems: 'center', marginBottom: 20, 
    elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1 
  },
  icon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});

export default ParentDashboard;
