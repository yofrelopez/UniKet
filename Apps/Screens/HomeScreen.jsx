


import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/HomeScreen/Header'
import Slider from '../Components/HomeScreen/Slider'
import { collection, getFirestore, orderBy, query, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Categories from '../Components/HomeScreen/Categories';
import LatestItemList from '../Components/HomeScreen/LatestItemList';

export default function HomeScreen() {
 
  const db = getFirestore(app);
  const [sliderList, setSliderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);

  useEffect(() => {
    subscribeToLatestItems();
    subscribeToSliders();
    subscribeToCategories();
  }, []);

  /**
   * Suscribirse a los sliders en tiempo real
   */
  const subscribeToSliders = () => {
    const q = collection(db, 'Sliders');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sliders = snapshot.docs.map(doc => doc.data());
      setSliderList(sliders);
    });

    return unsubscribe;
  };

  /**
   * Suscribirse a las categorías en tiempo real
   */
  const subscribeToCategories = () => {
    const q = collection(db, 'Category');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => doc.data());
      setCategoryList(categories);
    });

    return unsubscribe;
  };

  /**
   * Suscribirse a los últimos ítems en tiempo real
   */
  const subscribeToLatestItems = () => {
    const q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("🔄 Actualización en UserPost detectada!");
      
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLatestItemList(items);
    });

    return unsubscribe;
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View className="bg-white">
          {/* Header */}
          <View className="pt-8 pb-2 px-4">
            <Header />
          </View>

          {/* Slider con estilos adecuados */}
          {sliderList.length > 0 && (
            <View className="px-4 pt-4">
              <Slider sliderList={sliderList} />
            </View>
          )}

          {/* Categorías con padding correcto */}
          {categoryList.length > 0 && (
            <View className="px-4 pt-4">
              <Categories categoryList={categoryList} />
            </View>
          )}

          {/* Título de la sección de ítems */}
          <Text className="text-[20px] font-bold mt-4 px-6">Latest Items</Text>
        </View>
      }
      data={latestItemList}
      keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
      numColumns={2} // 🔥 Hace que los ítems se muestren en dos columnas
      columnWrapperStyle={{ gap: 0 }}
      renderItem={({ item }) => (
        <View className="w-[50%] p-1">
          <LatestItemList latestItemList={[item]} />
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 26, paddingHorizontal: 16, backgroundColor: 'white' }}
    />
  )
}
