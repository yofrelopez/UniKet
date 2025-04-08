import { View, Text, ScrollView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, getFirestore, orderBy, query, where, onSnapshot } from 'firebase/firestore'
import { app } from '../../firebaseConfig'
import LatestItemList from '../Components/HomeScreen/LatestItemList'

export default function ExploreScreen() {

  const db=getFirestore(app)
  const [productList,setProductList]=useState([]);


  useEffect(() => {
    const q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));

    // 🔥 Escuchar cambios en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id, // Aseguramos que cada producto tenga un ID
        ...doc.data()
      }));
      setProductList(products); // Actualizamos el estado en tiempo real
    });

    return () => unsubscribe(); // Limpiar la suscripción cuando el componente se desmonte
  }, []);



  return (
    <FlatList
      ListHeaderComponent={
        <View className="p-5 py-8 bg-white">
          <Text className="text-[30px] font-bold">Explore More</Text>
        </View>
      }
      data={productList}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2} // 🔥 Muestra los ítems en dos columnas
      columnWrapperStyle={{ gap: 10, paddingHorizontal: 10 }} // 🔥 Controla la separación entre columnas
      renderItem={({ item }) => (
        <View className="w-[48%] bg-gray-100 rounded-lg shadow-sm p-2">
          <LatestItemList latestItemList={[item]} />
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 16, backgroundColor: "white" }}
    />
  )
}