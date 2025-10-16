<?php

namespace App\Http\Controllers;
use App\Models\Image;
use App\Http\Requests\StoreImageRequest;
use Illuminate\Support\Facades\Storage;


class ImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Image::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreImageRequest $request) {

        // Guardar imagen obligatoria
        $path = Storage::disk('public')->put('uploads', $request->file('url'));

        // Guardar audio obligatorio
        $audioPath = Storage::disk('public')->put('uploads', $request->file('audio_url'));

        $validatedData = $request->validated();
        $validatedData['url'] = $path;
        $validatedData['audio_url'] = $audioPath;

        $image = Image::create($validatedData);

        return response()->json($image, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Image $image)
    {
        return $image;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreImageRequest $request, Image $image)
    {
        $image->update($request->all());

        return response()->json($image);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Image $image)
    {
        $image->delete();

        return response()->json(null, 204);
    }

}
