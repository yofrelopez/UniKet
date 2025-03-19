import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ToastAndroid, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { app } from '../../firebaseConfig';
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, getDocs, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useUser } from '@clerk/clerk-expo';

export default function AddPostScreen() {
  const [loading, setLoading] = useState(false);
  const db = getFirestore(app);
  const storage = getStorage();
  const { user } = useUser();
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    getCategoryList();
    requestPermissions(); // 🔥 Pedimos permisos al cargar la pantalla
  }, []);

  // 🔥 Solicitar permisos antes de abrir la galería
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Debes permitir el acceso a la galería para subir imágenes.');
    }
  };

  // Obtener lista de categorías
  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, 'Category'));
    const categories = querySnapshot.docs.map(doc => doc.data());
    setCategoryList(categories);
  };

  // Seleccionar imagen desde la galería
  const pickImage = async (setFieldValue) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;
        console.log("📸 Imagen seleccionada:", selectedImage);
        setFieldValue('image', selectedImage); // 🔥 Guardamos la imagen en Formik
      }
    } catch (error) {
      console.error("❌ Error al seleccionar imagen:", error);
    }
  };

  // Método para enviar el formulario
  const onSubmitMethod = async (values, { resetForm }) => {
    try {
      setLoading(true);

      // Validar si se ha seleccionado una imagen
      if (!values.image) {
        Alert.alert("Error", "Debes seleccionar una imagen antes de publicar.");
        setLoading(false);
        return;
      }

      // Convertir imagen a Blob
      const response = await fetch(values.image);
      const blob = await response.blob();
      const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");

      // Subir imagen a Firebase Storage
      await uploadBytes(storageRef, blob);
      console.log('✅ Imagen subida con éxito');

      // Obtener URL de descarga
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("🔗 URL de la imagen:", downloadUrl);

      // Crear objeto con los datos
      const postData = {
        title: values.title,
        desc: values.desc,
        address: values.address,
        price: values.price,
        image: downloadUrl,
        userName: user.fullName,
        userEmail: user.primaryEmailAddress.emailAddress,
        userImage: user.imageUrl,
        category: values.category,
        createdAt: serverTimestamp() // 🔥 Se usa `serverTimestamp()`
      };

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, "UserPost"), postData);
      if (docRef.id) {
        setLoading(false);
        Alert.alert('Success!!!', 'Post Added Successfully.');
        resetForm(); // 🔥 Limpiar el formulario después del envío
      }
    } catch (error) {
      console.error("❌ Error al subir el post:", error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo subir el post.');
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollView className="p-10 bg-white">
        <Text className="text-[27px] font-bold">Add New Post</Text>
        <Text className="text-[16px] text-gray-500 mb-7">Create New Post and Start Selling</Text>
        <Formik
          initialValues={{
            title: '',
            desc: '',
            address: '',
            price: '',
            image: '',
            userName: '',
            userEmail: '',
            userImage: '',
            category: ''
          }}
          onSubmit={onSubmitMethod}
          validate={(values) => {
            const errors = {};
            if (!values.title) {
              ToastAndroid.show('Title Must be There', ToastAndroid.SHORT);
              errors.title = "Title Must be there";
            }
            return errors;
          }}
        >
          {({ handleChange, handleSubmit, values, setFieldValue }) => (
            <View>

              {/* Selección de imagen */}
              <TouchableOpacity onPress={() => pickImage(setFieldValue)}>
                {values.image ? (
                  <Image source={{ uri: values.image }} style={{ width: 100, height: 100, borderRadius: 15 }} />
                ) : (
                  <Image source={require('./../../assets/images/placeholder.jpg')} style={{ width: 100, height: 100, borderRadius: 15 }} />
                )}
              </TouchableOpacity>

              {/* Campos de entrada */}
              <TextInput style={styles.input} placeholder='Title' value={values.title} onChangeText={handleChange('title')} />
              <TextInput style={styles.input} placeholder='Description' value={values.desc} onChangeText={handleChange('desc')} numberOfLines={5} />
              <TextInput style={styles.input} placeholder='Price' value={values.price} onChangeText={handleChange('price')} keyboardType='number-pad' />
              <TextInput style={styles.input} placeholder='Address' value={values.address} onChangeText={handleChange('address')} />

              {/* Lista de categorías */}
              <View style={{ borderWidth: 1, borderRadius: 10, marginTop: 15 }}>
                <Picker selectedValue={values.category} onValueChange={(itemValue) => setFieldValue('category', itemValue)}>
                  {categoryList.length > 0 && categoryList.map((item, index) => (
                    <Picker.Item key={index} label={item?.name} value={item?.name} />
                  ))}
                </Picker>
              </View>

              {/* Botón de enviar */}
              <TouchableOpacity onPress={handleSubmit} disabled={loading} className="p-4 bg-blue-500 rounded-full mt-10" style={{ backgroundColor: loading ? '#ccc' : '#007BFF' }}>
                {loading ? <ActivityIndicator color='#fff' /> : <Text className="text-white text-center text-[16px]">Submit</Text>}
              </TouchableOpacity>

            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 17,
    textAlignVertical: 'top',
    fontSize: 17
  }
});
