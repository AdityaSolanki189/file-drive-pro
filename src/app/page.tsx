'use client';

import React from 'react';
import Image from 'next/image';

export default function Home() {
    return (
        <main>
            <div className="flex flex-col items-center justify-center text-2xl">
                <Image
                    src="/logo.png"
                    alt="FileDrivePro"
                    width="500"
                    height="500"
                    className='rounded-full my-10'
                />

                <h1 className="text-4xl font-bold">Welcome to FileDrivePro 🚀</h1>
            </div>
        </main>
    );
}
