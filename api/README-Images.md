# Image Storage System Documentation

## Descripción General

Este proyecto implementa un sistema completo de almacenamiento de imágenes utilizando Azure Blob Storage, diseñado específicamente para avatares de usuarios con características de seguridad y escalabilidad.

## 🏗️ Arquitectura

### Componentes Principales

```
UserStorageModule
├── UserStorageService     # Lógica de negocio para Azure Blob Storage
├── UserStorageController  # Endpoints REST para imágenes
└── DTOs                  # Data Transfer Objects para requests/responses
```

### Flujo de Datos

1. **Upload**: Cliente → API → Azure Blob Storage → Base de datos (URL)
2. **Access**: Cliente → API → Azure SAS Token → Blob Storage → Imagen

## 📡 API Endpoints

### 1. Subir Avatar de Usuario

**Endpoint:** `POST /users/:id/avatar`

**Descripción:** Sube una nueva imagen de avatar para un usuario. Automáticamente reemplaza la imagen anterior.

**Headers:**
```
Content-Type: multipart/form-data
```

**Parameters:**
- `id` (path): UUID del usuario

**Body (multipart/form-data):**
- `file`: Archivo de imagen (JPEG, PNG, WebP, máx. 5MB)

**Response (200 OK):**
```json
{
  "imageUrl": "https://tradepal.blob.core.windows.net/demo/avatars/user123-abc456.jpg",
  "message": "Avatar uploaded successfully"
}
```

**Errores Comunes:**
```json
// 400 - Tipo de archivo inválido
{
  "message": "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
  "error": "Bad Request",
  "statusCode": 400
}

// 400 - Archivo muy grande
{
  "message": "File size too large. Maximum size is 5MB.",
  "error": "Bad Request",
  "statusCode": 400
}

// 404 - Usuario no encontrado
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 2. Obtener URL Prefirmada

**Endpoint:** `GET /users/:id/avatar/presigned-url`

**Descripción:** Genera una URL temporal para acceder de forma segura al avatar del usuario.

**Parameters:**
- `id` (path): UUID del usuario

**Response (200 OK):**
```json
{
  "presignedUrl": "https://tradepal.blob.core.windows.net/demo/avatars/user123-abc456.jpg?sv=2021-08-06&se=2023-12-01T13%3A00%3A00Z&sr=b&sp=r&sig=...",
  "expiresAt": "2023-12-01T13:00:00.000Z",
  "message": "Presigned URL generated successfully"
}
```

**Errores Comunes:**
```json
// 404 - Usuario sin avatar
{
  "message": "User has no avatar image",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🔧 Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT_NAME=tu_nombre_de_cuenta
AZURE_STORAGE_ACCOUNT_KEY=tu_clave_de_acceso
AZURE_STORAGE_CONTAINER_NAME=nombre_del_contenedor
```

### Obtener Credenciales de Azure

1. **Azure Portal:**
   - Ve a tu Storage Account
   - Navega a "Access keys"
   - Copia `key1` o `key2`

2. **Azure CLI:**
   ```bash
   az storage account keys list --account-name tu_cuenta --resource-group tu_grupo
   ```

## 💻 Ejemplos de Uso

### Subir Avatar con cURL

```bash
curl -X POST \
  'http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000/avatar' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/avatar.jpg'
```

### Obtener URL Prefirmada con cURL

```bash
curl -X GET \
  'http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000/avatar/presigned-url'
```

### Frontend - React/Next.js

#### Subir Avatar

```javascript
const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`/api/users/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Upload successful:', result.imageUrl);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Uso
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadAvatar('user-id-here', file);
  }
};
```

#### Mostrar Avatar con URL Prefirmada

```javascript
import { useState, useEffect } from 'react';

const UserAvatar = ({ userId }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/avatar/presigned-url`);
        const data = await response.json();
        setAvatarUrl(data.presignedUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAvatarUrl();
    }
  }, [userId]);

  if (loading) return <div>Loading avatar...</div>;

  return avatarUrl ? (
    <img src={avatarUrl} alt="User Avatar" className="avatar" />
  ) : (
    <div className="no-avatar">No avatar uploaded</div>
  );
};
```

## 🔐 Seguridad

### Acceso Privado
- Las imágenes requieren URLs prefirmadas para ser accedidas
- URLs expiran después de 1 hora
- No hay acceso público directo a las imágenes

### Validaciones
- **Tipos de archivo:** Solo JPEG, PNG, WebP
- **Tamaño máximo:** 5MB por archivo
- **Validación de usuario:** Verifica que el usuario existe antes de subir

### Best Practices
- Usa HTTPS en producción
- Implementa rate limiting para uploads
- Considera autenticación/autorización adicional

## 🚀 Deployment

### Variables de Producción

```bash
# Ejemplo para Azure App Service
AZURE_STORAGE_ACCOUNT_NAME=prodstorageaccount
AZURE_STORAGE_ACCOUNT_KEY=tu_clave_de_produccion
AZURE_STORAGE_CONTAINER_NAME=user-avatars-prod
```

### Docker

El sistema funciona automáticamente con Docker usando las variables de entorno del contenedor.

## 🧪 Testing

### Datos de Seed

El sistema incluye usuarios de prueba con avatares:

```bash
npx prisma db seed
```

Usuarios generados:
- **María García:** Usuario con avatar de ejemplo
- **Ana Martín:** Usuario con avatar de ejemplo
- **Juan Pérez, Carlos López, Luis González:** Usuarios sin avatar

### Testing con Postman

Importa esta colección para probar los endpoints:

```json
{
  "info": { "name": "Image Storage API" },
  "item": [
    {
      "name": "Upload Avatar",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/test-image.jpg"
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/users/{{userId}}/avatar",
          "host": ["{{baseUrl}}"],
          "path": ["users", "{{userId}}", "avatar"]
        }
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### Error: "Public access is not permitted"
- **Causa:** Azure Storage Account no permite acceso público
- **Solución:** El sistema usa acceso privado por defecto, esto es normal

### Error: "Failed to upload file"
- **Verificar:** Variables de entorno de Azure
- **Verificar:** Permisos de la Storage Account
- **Verificar:** Conectividad a Azure

### Error: "User not found"
- **Verificar:** UUID del usuario es válido
- **Verificar:** Usuario existe en la base de datos

### URLs prefirmadas no funcionan
- **Verificar:** URL no ha expirado (1 hora de validez)
- **Verificar:** Generar nueva URL prefirmada

## 📝 Logs

El sistema incluye logs informativos:

```
🌱 Starting seed...
✅ Created 5 users
🗑️ Deleted previous avatar: avatars/user123-old.jpg
✅ Avatar uploaded successfully
```

## 🔄 Extensibilidad

### Para Otras Entidades

El módulo está diseñado para ser reutilizable:

```typescript
// Ejemplo: Imágenes de productos
@Injectable()
export class ProductStorageService extends BaseStorageService {
  async uploadProductImage(productId: string, file: any): Promise<string> {
    // Implementación similar usando el mismo servicio base
  }
}
```

### Configuración Modular

```typescript
@Module({
  imports: [UserStorageModule],
  // El módulo se puede importar en otros módulos
})
export class AnyModule {}
```