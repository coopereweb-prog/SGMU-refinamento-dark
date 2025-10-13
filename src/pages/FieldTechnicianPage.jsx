import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getTechnicianTasks, completeInstallationTask } from '../lib/supabase';
import { compressImage } from '../lib/image-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LogOut, Camera, UploadCloud, User, Loader2 } from 'lucide-react';
import { RouteGenerator } from '@/components/RouteGenerator';

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
      try {
        const tasksData = await getTechnicianTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Não foi possível carregar as tarefas.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const allPendingPoints = useMemo(() => {
    return tasks
      .map(task => task.points)
      .filter(p => p && p.latitude && p.longitude);
  }, [tasks]);

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

  const handleUpload = async (taskId, pointId, file, comment) => {
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

      await completeInstallationTask(taskId);

      toast.success('Foto enviada e tarefa concluída!');
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Falha no upload: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [pointId]: false }));
    }
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
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main>
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma instalação pendente no momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <RouteGenerator points={allPendingPoints} />
            <Card>
              <CardHeader>
                <CardTitle>Minhas Tarefas de Instalação</CardTitle>
                <CardDescription>
                  Complete as tarefas abaixo enviando a foto da placa instalada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="p-3 border rounded-md bg-gray-50 space-y-4">
                    <div>
                      <p className="font-medium">{task.points.name}</p>
                      <p className="text-sm text-gray-600">Cliente: {task.customer_name}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="file" 
                          accept="image/*"
                          className="flex-1" 
                          onChange={(e) => handleFileChange(task.points.id, e.target.files[0])} 
                          disabled={uploading[task.points.id] || compressing[task.points.id]} 
                        />
                        <Button 
                          onClick={() => handleUpload(task.id, task.points.id, selectedFiles[task.points.id], comments[task.points.id])} 
                          disabled={!selectedFiles[task.points.id] || uploading[task.points.id] || compressing[task.points.id]}
                          className="w-32"
                        >
                          {uploading[task.points.id] ? <Loader2 className="animate-spin" /> : <><UploadCloud className="h-4 w-4 mr-2" /> Enviar</>}
                        </Button>
                      </div>
                      {compressing[task.points.id] && <p className="text-sm text-gray-600 flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Comprimindo imagem...</p>}
                      <Textarea 
                        placeholder="Adicionar um comentário sobre a instalação (opcional)..."
                        value={comments[task.points.id] || ''}
                        onChange={(e) => handleCommentChange(task.points.id, e.target.value)}
                        disabled={uploading[task.points.id]}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default FieldTechnicianPage;