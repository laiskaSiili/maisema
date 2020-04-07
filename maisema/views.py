import os

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View


class HomeView(View):
    def get(self, request):
        return redirect('browser', path='root')

class BrowserView(View):
    def get(self, request, path):
        ctx = {}
        path_parts = path.split(settings.PATH_SEPERATOR)
        sys_path = os.path.join(settings.BROWSER_ROOT, *path_parts[1:]) #ignore root
        all_content = sorted(os.listdir(sys_path))
        ctx['files'] = []
        ctx['folders'] = []
        for f in all_content:
            if os.path.isfile(os.path.join(sys_path, f)):
                ctx['files'].append({
                    'name': f
                })
            else:
                ctx['folders'].append({
                    'name': f,
                    'path': settings.PATH_SEPERATOR.join([path, f])
                })
        # Create breadcrumbs
        ctx['breadcrumbs'] = []
        partial_path = []
        for part in path_parts:
            partial_path.append(part)
            ctx['breadcrumbs'].append({
                'name': part,
                'path': settings.PATH_SEPERATOR.join(partial_path)
            })
        return render(request, 'maisema/home.html', ctx)


    def post(self, request, path):
        file = request.FILES['file']
        file_fullpath = request.POST['path']
        #with open(os.path.join(settings.BROWSER_ROOT, file._name), 'wb') as f:
        #    f.write(file.read())
        return JsonResponse({
            'file': file._name,
            'file_fullpath': file_fullpath
            })