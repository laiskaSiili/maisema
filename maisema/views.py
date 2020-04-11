import os
from pathlib import Path

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.views import View

from maisema.decorator import sanitize_url_path


class HomeView(View):
    def get(self, request):
        return redirect('browser', url_path='root')


@method_decorator(sanitize_url_path, name='dispatch')
class BrowserView(View):
    def get(self, request, url_path):
        ctx = {}
        path_parts = url_path.split(settings.PATH_SEPERATOR)
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
                    'url_path': settings.PATH_SEPERATOR.join([url_path, f])
                })
        # Create breadcrumbs
        ctx['breadcrumbs'] = []
        partial_path = []
        for part in path_parts:
            partial_path.append(part)
            ctx['breadcrumbs'].append({
                'name': part,
                'url_path': settings.PATH_SEPERATOR.join(partial_path)
            })
        return render(request, 'maisema/home.html', ctx)


    def post(self, request, url_path):
        path_parts = url_path.split(settings.PATH_SEPERATOR)
        sys_path = os.path.join(settings.BROWSER_ROOT, *path_parts[1:]) #ignore root

        file = request.FILES['file']
        file_relpath = request.POST['path']

        rel_directory = os.path.dirname(file_relpath)
        abs_directory = os.path.join(sys_path, rel_directory)
        Path(abs_directory).mkdir(exist_ok=True, parents=True)
        abs_file = os.path.join(abs_directory, file._name)
        with open(abs_file, 'wb') as f:
            f.write(file.read())

        return JsonResponse({
            'file': file._name,
            'file_relpath': file_relpath,
            'written_to': abs_file
            })