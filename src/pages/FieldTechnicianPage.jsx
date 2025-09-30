import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/image-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LogOut, Camera, UploadCloud, Paperclip, User, Map, Loader2 } from 'lucide-react';

function FieldTechnicianPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [comments, setComments] = useState({});
  const [uploading, setUploading] = useState({});
  const [compressing, setCompressing] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, customer_name,
          order_items (
            id,
            points (id, name, installation_photo_url, latitude, longitude, installation_notes)
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Não foi possível carregar as tarefas.");
      } else {
        const pendingTasks = data.filter(order => 
          order.order_items.some(item => !item.points.installation_photo_url)
        );
        setTasks(pendingTasks);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const handleFileChange = async (pointId, file) => {
    if (!file) {
      setSelectedFiles(prev => ({ ...prev, [pointId]: null }));
      return;
    }
    setCompressing(prev => ({ ...prev, [pointId]: true }));
    try {
      const compressedFile = await compressImage(file);
      setSelectedFiles(prev => ({ ...prev, [pointId]: compressedFile }));
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Erro ao processar imagem.", { description: "Por favor, tente um arquivo diferente." });
      setSelectedFiles(prev => ({ ...prev, [pointId]: null }));
    } finally {
      setCompressing(prev => ({ ...prev, [pointId]: false }));
    }
  };

  const handleCommentChange = (pointId, text) => {
    setComments(prev => ({ ...prev, [pointId]: text }));
  };

  const handleUpload = async (pointId, file, comment) => {
    if (!file) {
      toast.warning('Por favor, selecione um arquivo primeiro.');
      return;
    }
    setUploading(prev => ({ ...prev, [pointId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pointId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('installation-photos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('installation-photos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('points')
        .update({ 
          installation_photo_url: publicUrl,
          installation_notes: comment || null
        })
        .eq('id', pointId);
      if (updateError) throw updateError;

      toast.success('Foto enviada com sucesso!');
      setTasks(prevTasks => prevTasks.map(task => ({
        ...task,
        order_items: task.order_items.map(item => 
          item.points.id === pointId 
            ? { ...item, points: { ...item.points, installation_photo_url: publicUrl, installation_notes: comment } } 
            : item
        )
      })));

    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Falha no upload: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [pointId]: false }));
    }
  };

  const handleGenerateRoute = () => {
    const pendingPoints = tasks.flatMap(order => 
        order.order_items.filter(item => !item.points.installation_photo_url)
    ).map(item => item.points);

    if (pendingPoints.length < 1) {
        toast.info("Nenhuma tarefa pendente para gerar rota.");
        return;
    }
    
    if (pendingPoints.length === 1) {
        const point = pendingPoints[0];
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`, '_blank');
        return;
    }

    const waypoints = pendingPoints
        .slice(0, -1)
        .map(p => `${p.latitude},${p.longitude}`)
        .join('|');
    
    const destination = pendingPoints[pendingPoints.length - 1];
    const destinationStr = `${destination.latitude},${destination.longitude}`;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationStr}&waypoints=${waypoints}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Carregando tarefas...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel do Técnico</h1>
          <p className="text-gray-600">Tarefas de instalação de placas</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleGenerateRoute} variant="outline">
            <Map className="h-4 w-4 mr-2" /> Gerar Rota Otimizada
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main>
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma instalação com foto pendente no momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>Pedido #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription className="flex items-center pt-1">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    Cliente: {order.customer_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.order_items.filter(item => !item.points.installation_photo_url).map(item => (
                    <div key={item.id} className="p-3 border rounded-md bg-gray-50 space-y-4">
                      <p className="font-medium">{item.points.name}</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept="image/*"
                            className="flex-1" 
                            onChange={(e) => handleFileChange(item.points.id, e.target.files[0])} 
                            disabled={uploading[item.points.id] || compressing[item.points.id]} 
                          />
                          <Button 
                            onClick={() => handleUpload(item.points.id, selectedFiles[item.points.id], comments[item.points.id])} 
                            disabled={!selectedFiles[item.points.id] || uploading[item.points.id] || compressing[item.points.id]}
                            className="w-32"
                          >
                            {uploading[item.points.id] ? <Loader2 className="animate-spin" /> : <><UploadCloud className="h-4 w-4 mr-2" /> Enviar</>}
                          </Button>
                        </div>
                        {compressing[item.points.id] && <p className="text-sm text-gray-600 flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Comprimindo imagem...</p>}
                        <Textarea 
                          placeholder="Adicionar um comentário sobre a instalação (opcional)..."
                          value={comments[item.points.id] || ''}
                          onChange={(e) => handleCommentChange(item.points.id, e.target.value)}
                          disabled={uploading[item.points.id]}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FieldTechnicianPage;