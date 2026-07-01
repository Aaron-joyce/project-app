using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dtos;

namespace backend.Services;

public interface IPersonService
{
    Task<IEnumerable<PersonResponseDto>> GetAllPersonsAsync(Guid currentUserId);
    Task<PersonResponseDto> GetPersonByIdAsync(Guid id, Guid currentUserId);
    Task<Guid> RegisterPersonAsync(PersonDto dto);
    Task UpdatePersonAsync(Guid id, PersonDto dto, Guid currentUserId);
    Task<LoginResponseDto> AuthenticateAsync(LoginDto loginDto);
    Task<Guid> AddDrawingAsync(Guid personId, MapDrawingDto dto);
    Task UpdateDrawingAsync(Guid personId, Guid drawingId, MapDrawingDto dto);
    Task DeleteDrawingAsync(Guid personId, Guid drawingId);
}
